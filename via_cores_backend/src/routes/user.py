from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.user import User, db
from src.models.log import Log
import json

user_bp = Blueprint('user', __name__)

def log_action(action, user_id=None):
    """Registra uma ação no log do sistema"""
    log_entry = Log(action=action, user_id=user_id)
    db.session.add(log_entry)
    db.session.commit()

@user_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        session['user_id'] = user.id
        log_action(f'Login bem-sucedido', user.id)
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    else:
        log_action(f'Tentativa de login falhou para o usuário: {username}')
        return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401

@user_bp.route('/logout', methods=['POST', 'OPTIONS'])
@cross_origin()
def logout():
    if request.method == 'OPTIONS':
        return '', 200
    
    user_id = session.get('user_id')
    if user_id:
        log_action('Logout', user_id)
        session.pop('user_id', None)
    
    return jsonify({'success': True})

@user_bp.route('/users', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_users():
    if request.method == 'OPTIONS':
        return '', 200
    
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_user():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    
    # Verifica se o usuário já existe
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Usuário já existe'}), 400
    
    user = User(
        username=data['username'],
        role=data.get('role', 'user')
    )
    user.set_password(data['password'])
    
    # Define permissões padrão baseadas no role
    default_permissions = get_default_permissions(data.get('role', 'user'))
    user.set_permissions(default_permissions)
    
    db.session.add(user)
    db.session.commit()
    
    log_action(f'Usuário criado: {user.username}', session.get('user_id'))
    
    return jsonify({'success': True, 'user': user.to_dict()}), 201

@user_bp.route('/users/<int:user_id>', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = User.query.get_or_404(user_id)
    data = request.json
    
    user.username = data.get('username', user.username)
    user.role = data.get('role', user.role)
    
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    if 'permissions' in data:
        user.set_permissions(data['permissions'])
    
    db.session.commit()
    
    log_action(f'Usuário atualizado: {user.username}', session.get('user_id'))
    
    return jsonify({'success': True, 'user': user.to_dict()})

@user_bp.route('/users/<int:user_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_user(user_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = User.query.get_or_404(user_id)
    username = user.username
    
    db.session.delete(user)
    db.session.commit()
    
    log_action(f'Usuário excluído: {username}', session.get('user_id'))
    
    return jsonify({'success': True})

@user_bp.route('/change-password', methods=['POST', 'OPTIONS'])
@cross_origin()
def change_password():
    if request.method == 'OPTIONS':
        return '', 200
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    user = User.query.get(user_id)
    data = request.json
    
    if not user.check_password(data['old_password']):
        return jsonify({'success': False, 'message': 'Senha atual incorreta'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    log_action('Senha alterada pelo próprio usuário', user_id)
    
    return jsonify({'success': True})

def get_default_permissions(role):
    """Retorna as permissões padrão baseadas no role do usuário"""
    if role == 'admin-master':
        return {'all': True}
    elif role == 'admin-setor':
        return {
            'estoque': {'visualizar': True, 'cadastrar': True, 'editar': True, 'excluir': True, 'movimentar': True},
            'pedidos': {'visualizar': True, 'importar': True, 'editar': True, 'excluir': True, 'cadastrar': True},
            'bancoImagens': {'visualizar': True, 'adicionar': True, 'excluir': True},
            'producao': {'visualizar': True, 'adicionar': True, 'editar': True, 'excluir': True},
            'costura': {'visualizar': True, 'adicionar': True, 'editar': True, 'excluir': True},
            'expedicao': {'visualizar': True, 'adicionar': True, 'editar': True, 'excluir': True},
            'chat': {'visualizar': True, 'enviar': True}
        }
    else:  # user
        return {
            'estoque': {'visualizar': False, 'cadastrar': False, 'editar': False, 'excluir': False, 'movimentar': False},
            'pedidos': {'visualizar': False, 'importar': False, 'editar': False, 'excluir': False, 'cadastrar': False},
            'bancoImagens': {'visualizar': False, 'adicionar': False, 'excluir': False},
            'producao': {'visualizar': False, 'adicionar': False, 'editar': False, 'excluir': False},
            'costura': {'visualizar': False, 'adicionar': False, 'editar': False, 'excluir': False},
            'expedicao': {'visualizar': False, 'adicionar': False, 'editar': False, 'excluir': False},
            'chat': {'visualizar': True, 'enviar': False}
        }
