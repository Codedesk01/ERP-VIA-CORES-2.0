from flask import Blueprint, jsonify, request, session, send_from_directory
from flask_cors import cross_origin
from src.models.image import Image, db
from src.models.user import User
from src.models.log import Log
from werkzeug.utils import secure_filename
import os
import uuid

image_bp = Blueprint('image', __name__)

UPLOAD_FOLDER = 'uploads/images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def log_action(action, user_id=None):
    """Registra uma ação no log do sistema"""
    log_entry = Log(action=action, user_id=user_id)
    db.session.add(log_entry)
    db.session.commit()

def get_current_user():
    """Retorna o usuário atual baseado na sessão"""
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """Garante que o diretório de upload existe"""
    upload_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), UPLOAD_FOLDER)
    os.makedirs(upload_path, exist_ok=True)
    return upload_path

@image_bp.route('/images', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_images():
    if request.method == 'OPTIONS':
        return '', 200
    
    sku_filter = request.args.get('sku', '')
    
    query = Image.query
    
    if sku_filter:
        query = query.filter(Image.sku.ilike(f'%{sku_filter}%'))
    
    images = query.order_by(Image.created_at.desc()).all()
    return jsonify([image.to_dict() for image in images])

@image_bp.route('/images', methods=['POST', 'OPTIONS'])
@cross_origin()
def upload_image():
    if request.method == 'OPTIONS':
        return '', 200
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    sku = request.form.get('sku', '').upper()
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'Nenhum arquivo selecionado'}), 400
    
    if not sku:
        return jsonify({'success': False, 'message': 'SKU é obrigatório'}), 400
    
    if file and allowed_file(file.filename):
        # Gera um nome único para o arquivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        upload_path = ensure_upload_folder()
        file_path = os.path.join(upload_path, unique_filename)
        
        file.save(file_path)
        
        user = get_current_user()
        
        # Salva no banco de dados
        image = Image(
            sku=sku,
            filename=filename,
            path=os.path.join(UPLOAD_FOLDER, unique_filename),
            uploaded_by=user.id if user else None
        )
        
        db.session.add(image)
        db.session.commit()
        
        log_action(f'Imagem enviada: {sku} ({filename})', user.id if user else None)
        
        return jsonify({'success': True, 'image': image.to_dict()}), 201
    
    return jsonify({'success': False, 'message': 'Tipo de arquivo não permitido'}), 400

@image_bp.route('/images/<int:image_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_image(image_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    image = Image.query.get_or_404(image_id)
    sku = image.sku
    filename = image.filename
    
    # Remove o arquivo físico
    try:
        full_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), image.path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        print(f"Erro ao remover arquivo: {e}")
    
    # Remove do banco de dados
    db.session.delete(image)
    db.session.commit()
    
    log_action(f'Imagem removida: {sku} ({filename})', session.get('user_id'))
    
    return jsonify({'success': True})

@image_bp.route('/images/serve/<path:filename>', methods=['GET'])
def serve_image(filename):
    """Serve as imagens armazenadas"""
    upload_path = ensure_upload_folder()
    return send_from_directory(upload_path, filename)

@image_bp.route('/images/search', methods=['POST', 'OPTIONS'])
@cross_origin()
def search_images():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    skus = data.get('skus', [])
    
    if not skus:
        return jsonify({'success': False, 'message': 'Lista de SKUs é obrigatória'}), 400
    
    # Normaliza os SKUs para maiúsculo
    skus = [sku.upper().strip() for sku in skus]
    
    # Busca as imagens
    found_images = Image.query.filter(Image.sku.in_(skus)).all()
    found_skus = [img.sku for img in found_images]
    
    # Identifica SKUs não encontrados
    not_found_skus = [sku for sku in skus if sku not in found_skus]
    
    return jsonify({
        'success': True,
        'found_images': [img.to_dict() for img in found_images],
        'not_found_skus': not_found_skus,
        'total_searched': len(skus),
        'total_found': len(found_images)
    })

@image_bp.route('/images/bulk-upload', methods=['POST', 'OPTIONS'])
@cross_origin()
def bulk_upload_images():
    if request.method == 'OPTIONS':
        return '', 200
    
    if 'files' not in request.files:
        return jsonify({'success': False, 'message': 'Nenhum arquivo enviado'}), 400
    
    files = request.files.getlist('files')
    uploaded_count = 0
    errors = []
    
    user = get_current_user()
    upload_path = ensure_upload_folder()
    
    for file in files:
        try:
            if file.filename == '':
                continue
            
            if not allowed_file(file.filename):
                errors.append(f'Arquivo {file.filename} não é um tipo permitido')
                continue
            
            # Extrai o SKU do nome do arquivo (remove a extensão)
            sku = os.path.splitext(file.filename)[0].upper()
            
            # Gera um nome único para o arquivo
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            
            file_path = os.path.join(upload_path, unique_filename)
            file.save(file_path)
            
            # Salva no banco de dados
            image = Image(
                sku=sku,
                filename=filename,
                path=os.path.join(UPLOAD_FOLDER, unique_filename),
                uploaded_by=user.id if user else None
            )
            
            db.session.add(image)
            uploaded_count += 1
            
        except Exception as e:
            errors.append(f'Erro ao processar {file.filename}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Upload em massa: {uploaded_count} imagens enviadas', user.id if user else None)
    
    return jsonify({
        'success': True,
        'uploaded': uploaded_count,
        'errors': errors
    })

