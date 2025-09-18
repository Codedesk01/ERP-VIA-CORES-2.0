from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.production import ProductionItem, SewingTask, db
from src.models.user import User
from src.models.log import Log
from datetime import datetime

production_bp = Blueprint('production', __name__)

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

@production_bp.route('/production', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_production_items():
    if request.method == 'OPTIONS':
        return '', 200
    
    printer_filter = request.args.get('printer', '')
    status_filter = request.args.get('status', '')
    
    query = ProductionItem.query
    
    if printer_filter:
        query = query.filter(ProductionItem.printer == printer_filter)
    
    if status_filter:
        query = query.filter(ProductionItem.status == status_filter)
    
    items = query.order_by(ProductionItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@production_bp.route('/production', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_production_item():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    user = get_current_user()
    
    item = ProductionItem(
        order_id=data['order_id'],
        sku=data['sku'].upper(),
        quantity=data.get('quantity', 1),
        printer=data['printer'],
        status=data.get('status', 'Pendente'),
        assigned_to=user.id if user else None
    )
    
    db.session.add(item)
    db.session.commit()
    
    log_action(f'Item adicionado à produção: {item.sku} (Impressora {item.printer})', user.id if user else None)
    
    return jsonify({'success': True, 'item': item.to_dict()}), 201

@production_bp.route('/production/<int:item_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_production_item(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    item = ProductionItem.query.get_or_404(item_id)
    data = request.json
    
    item.status = data.get('status', item.status)
    item.printer = data.get('printer', item.printer)
    item.quantity = data.get('quantity', item.quantity)
    
    db.session.commit()
    
    log_action(f'Item de produção atualizado: {item.sku}', session.get('user_id'))
    
    return jsonify({'success': True, 'item': item.to_dict()})

@production_bp.route('/production/<int:item_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_production_item(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    item = ProductionItem.query.get_or_404(item_id)
    sku = item.sku
    
    db.session.delete(item)
    db.session.commit()
    
    log_action(f'Item removido da produção: {sku}', session.get('user_id'))
    
    return jsonify({'success': True})

@production_bp.route('/production/bulk-move', methods=['POST', 'OPTIONS'])
@cross_origin()
def bulk_move_to_production():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    items = data.get('items', [])
    printer = data.get('printer', '')
    
    created_count = 0
    errors = []
    
    user = get_current_user()
    
    for item_data in items:
        try:
            production_item = ProductionItem(
                order_id=item_data.get('order_id', ''),
                sku=item_data['sku'].upper(),
                quantity=item_data.get('quantity', 1),
                printer=printer,
                status='Pendente',
                assigned_to=user.id if user else None
            )
            
            db.session.add(production_item)
            created_count += 1
            
        except Exception as e:
            errors.append(f'Erro no item {item_data}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Movimentação em massa para produção: {created_count} itens (Impressora {printer})', user.id if user else None)
    
    return jsonify({
        'success': True,
        'created': created_count,
        'errors': errors
    })

# Rotas para Costura

@production_bp.route('/sewing', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_sewing_tasks():
    if request.method == 'OPTIONS':
        return '', 200
    
    status_filter = request.args.get('status', '')
    
    query = SewingTask.query
    
    if status_filter:
        query = query.filter(SewingTask.status == status_filter)
    
    tasks = query.order_by(SewingTask.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

@production_bp.route('/sewing', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_sewing_task():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    user = get_current_user()
    
    task = SewingTask(
        production_item_id=data['production_item_id'],
        sku=data['sku'].upper(),
        quantity=data.get('quantity', 1),
        status=data.get('status', 'Pendente'),
        user_id=user.id if user else None
    )
    
    db.session.add(task)
    db.session.commit()
    
    log_action(f'Tarefa de costura criada: {task.sku}', user.id if user else None)
    
    return jsonify({'success': True, 'task': task.to_dict()}), 201

@production_bp.route('/sewing/<int:task_id>/start', methods=['POST', 'OPTIONS'])
@cross_origin()
def start_sewing_task(task_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    task = SewingTask.query.get_or_404(task_id)
    user = get_current_user()
    
    task.status = 'Em Andamento'
    task.start_time = datetime.utcnow()
    task.user_id = user.id if user else None
    
    db.session.commit()
    
    log_action(f'Tarefa de costura iniciada: {task.sku}', user.id if user else None)
    
    return jsonify({'success': True, 'task': task.to_dict()})

@production_bp.route('/sewing/<int:task_id>/pause', methods=['POST', 'OPTIONS'])
@cross_origin()
def pause_sewing_task(task_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    task = SewingTask.query.get_or_404(task_id)
    data = request.json
    
    task.status = 'Pausada'
    task.paused_time += data.get('paused_seconds', 0)
    
    db.session.commit()
    
    log_action(f'Tarefa de costura pausada: {task.sku}', session.get('user_id'))
    
    return jsonify({'success': True, 'task': task.to_dict()})

@production_bp.route('/sewing/<int:task_id>/complete', methods=['POST', 'OPTIONS'])
@cross_origin()
def complete_sewing_task(task_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    task = SewingTask.query.get_or_404(task_id)
    
    task.status = 'Concluída'
    task.end_time = datetime.utcnow()
    
    db.session.commit()
    
    log_action(f'Tarefa de costura concluída: {task.sku}', session.get('user_id'))
    
    return jsonify({'success': True, 'task': task.to_dict()})

@production_bp.route('/sewing/<int:task_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_sewing_task(task_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    task = SewingTask.query.get_or_404(task_id)
    sku = task.sku
    
    db.session.delete(task)
    db.session.commit()
    
    log_action(f'Tarefa de costura removida: {sku}', session.get('user_id'))
    
    return jsonify({'success': True})

