import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.stock import stock_bp
from src.routes.order import order_bp
from src.routes.production import production_bp
from src.routes.shipping import shipping_bp
from src.routes.image import image_bp
from src.routes.chat import chat_bp
from src.routes.log import log_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configuração CORS para permitir requisições do frontend
CORS(app, supports_credentials=True)

# Registra todos os blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(stock_bp, url_prefix='/api')
app.register_blueprint(order_bp, url_prefix='/api')
app.register_blueprint(production_bp, url_prefix='/api')
app.register_blueprint(shipping_bp, url_prefix='/api')
app.register_blueprint(image_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')
app.register_blueprint(log_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Importa todos os modelos para garantir que as tabelas sejam criadas
from src.models.user import User
from src.models.stock import StockItem, Transaction
from src.models.order import Order
from src.models.production import ProductionItem, SewingTask
from src.models.shipping import ShippingPackage
from src.models.image import Image
from src.models.chat import Conversation, Message
from src.models.log import Log

with app.app_context():
    db.create_all()
    
    # Cria usuário admin padrão se não existir
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(username='admin', role='admin-master')
        admin_user.set_password('admin')
        admin_user.set_permissions({'all': True})
        db.session.add(admin_user)
        db.session.commit()
        print("Usuário admin criado com sucesso!")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
