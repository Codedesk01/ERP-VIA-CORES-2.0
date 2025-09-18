from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from src.models.log import Log, db
from src.models.user import User

log_bp = Blueprint('log', __name__)

def get_current_user():
    """Retorna o usuário atual baseado na sessão"""
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None

@log_bp.route('/logs', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_logs():
    if request.method == 'OPTIONS':
        return '', 200
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    user_filter = request.args.get('user', '')
    action_filter = request.args.get('action', '')
    
    query = Log.query
    
    if user_filter:
        # Busca por username
        user = User.query.filter_by(username=user_filter).first()
        if user:
            query = query.filter(Log.user_id == user.id)
        else:
            # Se não encontrar o usuário, filtra por logs sem usuário (sistema)
            query = query.filter(Log.user_id.is_(None))
    
    if action_filter:
        query = query.filter(Log.action.ilike(f'%{action_filter}%'))
    
    logs = query.order_by(Log.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'logs': [log.to_dict() for log in logs.items],
        'total': logs.total,
        'pages': logs.pages,
        'current_page': page
    })

@log_bp.route('/logs/stats', methods=['GET', 'OPTIONS'])
@cross_origin()
def get_log_stats():
    if request.method == 'OPTIONS':
        return '', 200
    
    total_logs = Log.query.count()
    
    # Logs por usuário
    user_stats = db.session.query(
        User.username,
        db.func.count(Log.id).label('count')
    ).outerjoin(Log, User.id == Log.user_id).group_by(User.username).all()
    
    # Logs do sistema (sem usuário)
    system_logs = Log.query.filter(Log.user_id.is_(None)).count()
    
    # Adiciona logs do sistema às estatísticas
    user_stats_dict = {stat[0]: stat[1] for stat in user_stats}
    if system_logs > 0:
        user_stats_dict['Sistema'] = system_logs
    
    return jsonify({
        'total_logs': total_logs,
        'user_stats': user_stats_dict
    })

@log_bp.route('/logs/clear', methods=['POST', 'OPTIONS'])
@cross_origin()
def clear_logs():
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_current_user()
    if not user or user.role != 'admin-master':
        return jsonify({'success': False, 'message': 'Acesso negado'}), 403
    
    data = request.json
    keep_last = data.get('keep_last', 0)  # Quantos logs manter
    
    if keep_last > 0:
        # Mantém os últimos N logs
        logs_to_keep = Log.query.order_by(Log.timestamp.desc()).limit(keep_last).all()
        keep_ids = [log.id for log in logs_to_keep]
        
        if keep_ids:
            deleted_count = Log.query.filter(~Log.id.in_(keep_ids)).count()
            Log.query.filter(~Log.id.in_(keep_ids)).delete(synchronize_session=False)
        else:
            deleted_count = Log.query.count()
            Log.query.delete()
    else:
        # Remove todos os logs
        deleted_count = Log.query.count()
        Log.query.delete()
    
    db.session.commit()
    
    # Registra a ação de limpeza
    log_entry = Log(action=f'Logs limpos: {deleted_count} removidos', user_id=user.id)
    db.session.add(log_entry)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'deleted_count': deleted_count
    })

