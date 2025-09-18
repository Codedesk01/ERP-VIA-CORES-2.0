from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.stock import StockItem, Transaction, db
from src.models.user import User
from src.models.log import Log
import json

stock_bp = Blueprint('stock', __name__)

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

@stock_bp.route('/stock', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_stock():
    if request.method == 'OPTIONS':
        return '', 200
    
    items = StockItem.query.all()
    return jsonify([item.to_dict() for item in items])

@stock_bp.route('/stock', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_stock_item():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    
    # Verifica se o SKU já existe
    existing_item = StockItem.query.filter_by(sku=data['sku'].upper()).first()
    if existing_item:
        return jsonify({'success': False, 'message': 'SKU já existe'}), 400
    
    item = StockItem(
        sku=data['sku'].upper(),
        quantity=data.get('quantity', 0),
        shelf=data['shelf'].upper(),
        status=data.get('status', 'Disponível')
    )
    
    db.session.add(item)
    db.session.commit()
    
    # Registra a transação de cadastro
    user = get_current_user()
    transaction = Transaction(
        user_id=user.id if user else None,
        sku=item.sku,
        quantity=item.quantity,
        type='CADASTRO',
        shelf=item.shelf,
        reason='Cadastro inicial do item'
    )
    db.session.add(transaction)
    db.session.commit()
    
    log_action(f'Item cadastrado: {item.sku}', user.id if user else None)
    
    return jsonify({'success': True, 'item': item.to_dict()}), 201

@stock_bp.route('/stock/<int:item_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_stock_item(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    item = StockItem.query.get_or_404(item_id)
    data = request.json
    
    old_quantity = item.quantity
    
    item.sku = data.get('sku', item.sku).upper()
    item.quantity = data.get('quantity', item.quantity)
    item.shelf = data.get('shelf', item.shelf).upper()
    item.status = data.get('status', item.status)
    
    db.session.commit()
    
    # Se a quantidade mudou, registra uma transação
    if old_quantity != item.quantity:
        user = get_current_user()
        quantity_diff = item.quantity - old_quantity
        transaction_type = 'ENTRADA' if quantity_diff > 0 else 'SAÍDA'
        
        transaction = Transaction(
            user_id=user.id if user else None,
            sku=item.sku,
            quantity=abs(quantity_diff),
            type=transaction_type,
            shelf=item.shelf,
            reason='Ajuste manual via edição'
        )
        db.session.add(transaction)
        db.session.commit()
    
    log_action(f'Item atualizado: {item.sku}', session.get('user_id'))
    
    return jsonify({'success': True, 'item': item.to_dict()})

@stock_bp.route('/stock/<int:item_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_stock_item(item_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    item = StockItem.query.get_or_404(item_id)
    sku = item.sku
    
    db.session.delete(item)
    db.session.commit()
    
    log_action(f'Item excluído: {sku}', session.get('user_id'))
    
    return jsonify({'success': True})

@stock_bp.route('/stock/movement', methods=['POST', 'OPTIONS'])
@cross_origin()
def stock_movement():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    sku = data['sku'].upper()
    quantity = int(data['quantity'])
    movement_type = data['type']  # 'ENTRADA' ou 'SAÍDA'
    shelf = data['shelf'].upper()
    reason = data.get('reason', '')
    
    # Busca o item no estoque
    item = StockItem.query.filter_by(sku=sku).first()
    if not item:
        return jsonify({'success': False, 'message': 'SKU não encontrado'}), 404
    
    # Verifica se a prateleira corresponde
    if item.shelf != shelf:
        return jsonify({'success': False, 'message': 'Prateleira incorreta'}), 400
    
    # Calcula a nova quantidade
    if movement_type == 'ENTRADA':
        new_quantity = item.quantity + quantity
    elif movement_type == 'SAÍDA':
        if item.quantity < quantity:
            return jsonify({'success': False, 'message': 'Quantidade insuficiente em estoque'}), 400
        new_quantity = item.quantity - quantity
    else:
        return jsonify({'success': False, 'message': 'Tipo de movimentação inválido'}), 400
    
    # Atualiza o item
    item.quantity = new_quantity
    db.session.commit()
    
    # Registra a transação
    user = get_current_user()
    transaction = Transaction(
        user_id=user.id if user else None,
        sku=sku,
        quantity=quantity,
        type=movement_type,
        shelf=shelf,
        reason=reason
    )
    db.session.add(transaction)
    db.session.commit()
    
    log_action(f'Movimentação de estoque: {movement_type} {quantity}x {sku}', user.id if user else None)
    
    return jsonify({'success': True, 'item': item.to_dict()})

@stock_bp.route('/stock/transactions', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_transactions():
    if request.method == 'OPTIONS':
        return '', 200
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    sku_filter = request.args.get('sku', '')
    type_filter = request.args.get('type', '')
    
    query = Transaction.query
    
    if sku_filter:
        query = query.filter(Transaction.sku.ilike(f'%{sku_filter}%'))
    
    if type_filter:
        query = query.filter(Transaction.type == type_filter)
    
    transactions = query.order_by(Transaction.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions.items],
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': page
    })

@stock_bp.route('/stock/bulk-import', methods=['POST', 'OPTIONS'])
@cross_origin()
def bulk_import():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    items = data.get('items', [])
    
    created_count = 0
    updated_count = 0
    errors = []
    
    user = get_current_user()
    
    for item_data in items:
        try:
            sku = item_data['sku'].upper()
            quantity = int(item_data['quantity'])
            shelf = item_data['shelf'].upper()
            
            existing_item = StockItem.query.filter_by(sku=sku).first()
            
            if existing_item:
                # Atualiza item existente
                old_quantity = existing_item.quantity
                existing_item.quantity = quantity
                existing_item.shelf = shelf
                updated_count += 1
                
                # Registra transação se a quantidade mudou
                if old_quantity != quantity:
                    quantity_diff = quantity - old_quantity
                    transaction_type = 'ENTRADA' if quantity_diff > 0 else 'SAÍDA'
                    
                    transaction = Transaction(
                        user_id=user.id if user else None,
                        sku=sku,
                        quantity=abs(quantity_diff),
                        type=transaction_type,
                        shelf=shelf,
                        reason='Importação em massa'
                    )
                    db.session.add(transaction)
            else:
                # Cria novo item
                new_item = StockItem(
                    sku=sku,
                    quantity=quantity,
                    shelf=shelf,
                    status='Disponível'
                )
                db.session.add(new_item)
                created_count += 1
                
                # Registra transação de cadastro
                transaction = Transaction(
                    user_id=user.id if user else None,
                    sku=sku,
                    quantity=quantity,
                    type='CADASTRO',
                    shelf=shelf,
                    reason='Importação em massa'
                )
                db.session.add(transaction)
                
        except Exception as e:
            errors.append(f'Erro no item {item_data}: {str(e)}')
    
    db.session.commit()
    
    log_action(f'Importação em massa: {created_count} criados, {updated_count} atualizados', user.id if user else None)
    
    return jsonify({
        'success': True,
        'created': created_count,
        'updated': updated_count,
        'errors': errors
    })

@stock_bp.route('/stock/clear', methods=['POST', 'OPTIONS'])
@cross_origin()
def clear_stock():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    prefix = data.get('prefix', '')
    
    if prefix:
        # Limpa apenas itens com o prefixo especificado
        items = StockItem.query.filter(StockItem.sku.startswith(prefix.upper())).all()
        count = len(items)
        for item in items:
            db.session.delete(item)
    else:
        # Limpa todo o estoque
        count = StockItem.query.count()
        StockItem.query.delete()
    
    db.session.commit()
    
    log_action(f'Limpeza de estoque: {count} itens removidos' + (f' (prefixo: {prefix})' if prefix else ''), session.get('user_id'))
    
    return jsonify({'success': True, 'removed_count': count})

