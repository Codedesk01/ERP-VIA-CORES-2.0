from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.shipping import ShippingPackage, db
from src.models.user import User
from src.models.log import Log
from datetime import datetime

shipping_bp = Blueprint('shipping', __name__)

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

@shipping_bp.route('/shipping', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_shipping_packages():
    if request.method == 'OPTIONS':
        return '', 200
    
    marketplace_filter = request.args.get('marketplace', '')
    status_filter = request.args.get('status', '')
    
    query = ShippingPackage.query
    
    if marketplace_filter:
        query = query.filter(ShippingPackage.marketplace == marketplace_filter)
    
    if status_filter:
        query = query.filter(ShippingPackage.status == status_filter)
    
    packages = query.order_by(ShippingPackage.created_at.desc()).all()
    return jsonify([package.to_dict() for package in packages])

@shipping_bp.route('/shipping', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_shipping_package():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    user = get_current_user()
    
    package = ShippingPackage(
        order_id=data['order_id'],
        marketplace=data['marketplace'],
        tracking_code=data.get('tracking_code', ''),
        invoice=data.get('invoice', ''),
        customer=data.get('customer', ''),
        status=data.get('status', 'Preparando'),
        sent_by=user.id if user else None
    )
    
    package.set_sku_list(data.get('sku_list', []))
    
    db.session.add(package)
    db.session.commit()
    
    log_action(f'Pacote criado para expedição: {package.order_id} ({package.marketplace})', user.id if user else None)
    
    return jsonify({'success': True, 'package': package.to_dict()}), 201

@shipping_bp.route('/shipping/<int:package_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_shipping_package(package_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    package = ShippingPackage.query.get_or_404(package_id)
    data = request.json
    
    package.tracking_code = data.get('tracking_code', package.tracking_code)
    package.invoice = data.get('invoice', package.invoice)
    package.customer = data.get('customer', package.customer)
    package.status = data.get('status', package.status)
    
    if 'sku_list' in data:
        package.set_sku_list(data['sku_list'])
    
    # Se o status mudou para "Enviado", registra a data de envio
    if data.get('status') == 'Enviado' and package.status != 'Enviado':
        package.shipped_at = datetime.utcnow()
    
    db.session.commit()
    
    log_action(f'Pacote atualizado: {package.order_id}', session.get('user_id'))
    
    return jsonify({'success': True, 'package': package.to_dict()})

@shipping_bp.route('/shipping/<int:package_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_shipping_package(package_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    package = ShippingPackage.query.get_or_404(package_id)
    order_id = package.order_id
    
    db.session.delete(package)
    db.session.commit()
    
    log_action(f'Pacote removido: {order_id}', session.get('user_id'))
    
    return jsonify({'success': True})

@shipping_bp.route('/shipping/<int:package_id>/ship', methods=['POST', 'OPTIONS'])
@cross_origin()
def ship_package(package_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    package = ShippingPackage.query.get_or_404(package_id)
    data = request.json
    user = get_current_user()
    
    package.status = 'Enviado'
    package.tracking_code = data.get('tracking_code', package.tracking_code)
    package.invoice = data.get('invoice', package.invoice)
    package.shipped_at = datetime.utcnow()
    package.sent_by = user.id if user else None
    
    db.session.commit()
    
    log_action(f'Pacote enviado: {package.order_id} (Rastreio: {package.tracking_code})', user.id if user else None)
    
    return jsonify({'success': True, 'package': package.to_dict()})

@shipping_bp.route('/shipping/bulk-create', methods=['POST', 'OPTIONS'])
@cross_origin()
def bulk_create_packages():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    packages_data = data.get('packages', [])
    
    created_count = 0
    errors = []
    
    user = get_current_user()
    
    for package_data in packages_data:
        try:
            package = ShippingPackage(
                order_id=package_data['order_id'],
                marketplace=package_data['marketplace'],
                tracking_code=package_data.get('tracking_code', ''),
                invoice=package_data.get('invoice', ''),
                customer=package_data.get('customer', ''),
                status='Preparando',
                sent_by=user.id if user else None
            )
            
            package.set_sku_list(package_data.get('sku_list', []))
            
            db.session.add(package)
            created_count += 1
            
        except Exception as e:
            errors.append(f'Erro no pacote {package_data}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Criação em massa de pacotes: {created_count} criados', user.id if user else None)
    
    return jsonify({
        'success': True,
        'created': created_count,
        'errors': errors
    })

@shipping_bp.route('/shipping/history', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_shipping_history():
    if request.method == 'OPTIONS':
        return '', 200
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    sku_filter = request.args.get('sku', '')
    tracking_filter = request.args.get('tracking', '')
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    
    query = ShippingPackage.query.filter(ShippingPackage.status == 'Enviado')
    
    if sku_filter:
        query = query.filter(ShippingPackage.sku_list.contains(sku_filter))
    
    if tracking_filter:
        query = query.filter(ShippingPackage.tracking_code.ilike(f'%{tracking_filter}%'))
    
    if start_date:
        query = query.filter(ShippingPackage.shipped_at >= datetime.fromisoformat(start_date))
    
    if end_date:
        query = query.filter(ShippingPackage.shipped_at <= datetime.fromisoformat(end_date))
    
    packages = query.order_by(ShippingPackage.shipped_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'packages': [p.to_dict() for p in packages.items],
        'total': packages.total,
        'pages': packages.pages,
        'current_page': page
    })

