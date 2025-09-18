from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.chat import Conversation, Message, db
from src.models.user import User
from src.models.log import Log
import json

chat_bp = Blueprint('chat', __name__)

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

@chat_bp.route('/conversations', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_conversations():
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    # Busca conversas onde o usuário é participante
    conversations = Conversation.query.all()
    user_conversations = []
    
    for conv in conversations:
        participants = conv.get_participants()
        if user.username in participants:
            user_conversations.append(conv.to_dict())
    
    return jsonify(user_conversations)

@chat_bp.route('/conversations', methods=['POST', 'OPTIONS'])
@cross_origin()
def create_conversation():
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    data = request.json
    participants = data.get('participants', [])
    name = data.get('name', '')
    
    # Adiciona o usuário atual aos participantes se não estiver
    if user.username not in participants:
        participants.append(user.username)
    
    conversation = Conversation(name=name)
    conversation.set_participants(participants)
    
    db.session.add(conversation)
    db.session.commit()
    
    log_action(f'Conversa criada: {name or "Conversa individual"}', user.id)
    
    return jsonify({'success': True, 'conversation': conversation.to_dict()}), 201

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_messages(conversation_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    conversation = Conversation.query.get_or_404(conversation_id)
    
    # Verifica se o usuário é participante da conversa
    participants = conversation.get_participants()
    if user.username not in participants:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.timestamp.asc()).all()
    
    return jsonify([message.to_dict() for message in messages])

@chat_bp.route('/conversations/<int:conversation_id>/messages', methods=['POST', 'OPTIONS'])
@cross_origin()
def send_message(conversation_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    conversation = Conversation.query.get_or_404(conversation_id)
    
    # Verifica se o usuário é participante da conversa
    participants = conversation.get_participants()
    if user.username not in participants:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    data = request.json
    text = data.get('text', '')
    attachment = data.get('attachment', None)
    
    if not text and not attachment:
        return jsonify({'success': False, 'message': 'Mensagem ou anexo é obrigatório'}), 400
    
    message = Message(
        conversation_id=conversation_id,
        sender_id=user.id,
        text=text
    )
    
    if attachment:
        message.set_attachment(attachment)
    
    db.session.add(message)
    
    # Atualiza o timestamp da conversa
    conversation.updated_at = message.timestamp
    
    db.session.commit()
    
    log_action(f'Mensagem enviada na conversa {conversation_id}', user.id)
    
    return jsonify({'success': True, 'message': message.to_dict()}), 201

@chat_bp.route('/messages/<int:message_id>/read', methods=['POST', 'OPTIONS'])
@cross_origin()
def mark_message_as_read(message_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    message = Message.query.get_or_404(message_id)
    read_by = message.get_read_by()
    
    if user.username not in read_by:
        read_by.append(user.username)
        message.set_read_by(read_by)
        db.session.commit()
    
    return jsonify({'success': True})

@chat_bp.route('/conversations/<int:conversation_id>/mark-all-read', methods=['POST', 'OPTIONS'])
@cross_origin()
def mark_all_messages_as_read(conversation_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    conversation = Conversation.query.get_or_404(conversation_id)
    
    # Verifica se o usuário é participante da conversa
    participants = conversation.get_participants()
    if user.username not in participants:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    # Marca todas as mensagens como lidas pelo usuário
    messages = Message.query.filter_by(conversation_id=conversation_id).all()
    
    for message in messages:
        read_by = message.get_read_by()
        if user.username not in read_by:
            read_by.append(user.username)
            message.set_read_by(read_by)
    
    db.session.commit()
    
    return jsonify({'success': True})

@chat_bp.route('/users', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_chat_users():
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    # Retorna todos os usuários exceto o atual
    users = User.query.filter(User.id != user.id).all()
    
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role
    } for u in users])

@chat_bp.route('/notifications', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_notifications():
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    # Busca mensagens não lidas em conversas do usuário
    conversations = Conversation.query.all()
    unread_count = 0
    
    for conv in conversations:
        participants = conv.get_participants()
        if user.username in participants:
            messages = Message.query.filter_by(conversation_id=conv.id).all()
            for message in messages:
                read_by = message.get_read_by()
                if user.username not in read_by and message.sender_id != user.id:
                    unread_count += 1
    
    return jsonify({
        'unread_count': unread_count
    })

@chat_bp.route('/conversations/<int:conversation_id>', methods=['DELETE', 'OPTIONS'])
@cross_origin()
def delete_conversation(conversation_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    conversation = Conversation.query.get_or_404(conversation_id)
    
    # Verifica se o usuário é participante da conversa
    participants = conversation.get_participants()
    if user.username not in participants:
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    # Remove todas as mensagens da conversa
    Message.query.filter_by(conversation_id=conversation_id).delete()
    
    # Remove a conversa
    db.session.delete(conversation)
    db.session.commit()
    
    log_action(f'Conversa excluída: {conversation_id}', user.id)
    
    return jsonify({'success': True})

