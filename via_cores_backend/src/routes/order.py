from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.order import Order, db
from src.models.user import User
from src.models.log import Log
import json

order_bp = Blueprint('order', __name__)

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

@order_bp.route('/orders', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_orders():
    if request.method == 'OPTIONS':
        return '', 200
    
    status_filter = request.args.get('status', '')
    marketplace_filter = request.args.get('marketplace', '')
    
    query = Order.query
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    if marketplace_filter:
        query = query.filter(Order.marketplace == marketplace_filter)
    
    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders])

@order_bp.route('/orders', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_order():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    user = get_current_user()
    
    order = Order(
        marketplace=data['marketplace'],
        order_id=data['order_id'],
        sku=data['sku'].upper(),
        quantity=data.get('quantity', 1),
        status=data.get('status', 'Pendente'),
        user_id=user.id if user else None
    )
    
    db.session.add(order)
    db.session.commit()
    
    log_action(f'Pedido criado: {order.order_id} ({order.marketplace})', user.id if user else None)
    
    return jsonify({'success': True, 'order': order.to_dict()}), 201

@order_bp.route('/orders/<int:order_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_order(order_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    order = Order.query.get_or_404(order_id)
    data = request.json
    
    order.marketplace = data.get('marketplace', order.marketplace)
    order.order_id = data.get('order_id', order.order_id)
    order.sku = data.get('sku', order.sku).upper()
    order.quantity = data.get('quantity', order.quantity)
    order.status = data.get('status', order.status)
    order.error_message = data.get('error_message', order.error_message)
    
    db.session.commit()
    
    log_action(f'Pedido atualizado: {order.order_id}', session.get('user_id'))
    
    return jsonify({'success': True, 'order': order.to_dict()})

@order_bp.route('/orders/<int:order_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_order(order_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    order = Order.query.get_or_404(order_id)
    order_ref = order.order_id
    
    db.session.delete(order)
    db.session.commit()
    
    log_action(f'Pedido excluído: {order_ref}', session.get('user_id'))
    
    return jsonify({'success': True})

@order_bp.route('/orders/bulk-import', methods=['POST', 'OPTIONS'])
@cross_origin()
def bulk_import_orders():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    orders_data = data.get('orders', [])
    marketplace = data.get('marketplace', '')
    
    created_count = 0
    errors = []
    
    user = get_current_user()
    
    for order_data in orders_data:
        try:
            # Verifica se o pedido já existe
            existing_order = Order.query.filter_by(
                marketplace=marketplace,
                order_id=order_data['order_id']
            ).first()
            
            if existing_order:
                errors.append(f'Pedido {order_data["order_id"]} já existe')
                continue
            
            order = Order(
                marketplace=marketplace,
                order_id=order_data['order_id'],
                sku=order_data['sku'].upper(),
                quantity=order_data.get('quantity', 1),
                status='Pendente',
                user_id=user.id if user else None
            )
            
            db.session.add(order)
            created_count += 1
            
        except Exception as e:
            errors.append(f'Erro no pedido {order_data}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Importação de pedidos: {created_count} criados ({marketplace})', user.id if user else None)
    
    return jsonify({
        'success': True,
        'created': created_count,
        'errors': errors
    })

@order_bp.route('/orders/process', methods=['POST', 'OPTIONS'])
@cross_origin()
def process_orders():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    order_ids = data.get('order_ids', [])
    action = data.get('action', '')  # 'production', 'shipping', etc.
    
    processed_count = 0
    errors = []
    
    for order_id in order_ids:
        try:
            order = Order.query.get(order_id)
            if not order:
                errors.append(f'Pedido {order_id} não encontrado')
                continue
            
            if action == 'production':
                order.status = 'Em Produção'
            elif action == 'shipping':
                order.status = 'Enviado'
            elif action == 'completed':
                order.status = 'Concluído'
            
            processed_count += 1
            
        except Exception as e:
            errors.append(f'Erro ao processar pedido {order_id}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Processamento de pedidos: {processed_count} processados ({action})', session.get('user_id'))
    
    return jsonify({
        'success': True,
        'processed': processed_count,
        'errors': errors
    })

@order_bp.route('/orders/errors', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_error_orders():
    if request.method == 'OPTIONS':
        return '', 200
    
    error_orders = Order.query.filter(Order.error_message.isnot(None)).all()
    return jsonify([order.to_dict() for order in error_orders])

@order_bp.route('/orders/clear-errors', methods=['POST', 'OPTIONS'])
@cross_origin()
def clear_error_orders():
    if request.method == 'OPTIONS':
        return '', 200
    
    count = Order.query.filter(Order.error_message.isnot(None)).count()
    Order.query.filter(Order.error_message.isnot(None)).delete()
    db.session.commit()
    
    log_action(f'Pedidos com erro limpos: {count} removidos', session.get('user_id'))
    
    return jsonify({'success': True, 'removed_count': count})

