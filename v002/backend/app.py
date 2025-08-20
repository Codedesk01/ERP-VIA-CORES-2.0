# app.py
# ERP Via Cores 2.0 – Backend único (Flask + SQLAlchemy + JWT)
# Módulos: Núcleo/Admin, Autenticação, Estoque, Pedidos, Banco de Imagens, Produção, Costura, Expedição
# Permissões granulares (RBAC) + Logs de ações + Métricas para Dashboard

from datetime import datetime, timedelta
import json

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "../instance/erp_viacores.db")




from functools import wraps
from werkzeug.security import check_password_hash
from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS

# ==================
# Configuração básica
# ==================
app = Flask(__name__)
CORS(app)

# Troque por MySQL se quiser:
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://user:pass@host/db"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "troque-este-segredo"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ==================
# Tabelas do Núcleo
# ==================
class SystemLog(db.Model):
    __tablename__ = "system_logs"
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    action = db.Column(db.String(120), nullable=False)  # ex: estoque.movimentacao.create
    resource_type = db.Column(db.String(80))            # ex: Item, Pedido
    resource_id = db.Column(db.Integer)
    details = db.Column(db.Text)                        # json
    ip = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Role(db.Model):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True, nullable=False)  # admin, producao_full etc
    description = db.Column(db.String(200))
    permissions = db.relationship("RolePermission", backref="role", cascade="all, delete-orphan")

class Permission(db.Model):
    __tablename__ = "permissions"
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(120), unique=True, nullable=False) # ex: estoque.itens.view
    description = db.Column(db.String(200))

class RolePermission(db.Model):
    __tablename__ = "role_permissions"
    id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))
    permission_id = db.Column(db.Integer, db.ForeignKey("permissions.id"))
    permission = db.relationship("Permission")

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(60), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship("UserRole", backref="user", cascade="all, delete-orphan")

    def has_perm(self, code: str) -> bool:
        for ur in self.roles:
            for rp in ur.role.permissions:
                if rp.permission.code == code:
                    return True
        return False

class UserRole(db.Model):
    __tablename__ = "user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"))
    role = db.relationship("Role")

# ===========
# Decorators
# ===========
def log_action(action, resource_type=None, resource_id=None, details=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            resp = fn(*args, **kwargs)
            try:
                uid = None
                try:
                    user_id = get_jwt_identity()
                    uid = int(user_id) if user_id else None
                except Exception:
                    uid = None
                log = SystemLog(
                    actor_id=uid,
                    action=action,
                    resource_type=resource_type,
                    resource_id=resource_id if isinstance(resource_id, int) else None,
                    details=json.dumps(details() if callable(details) else details or extract_req()),
                    ip=request.headers.get("X-Forwarded-For", request.remote_addr)
                )
                db.session.add(log)
                db.session.commit()
            except Exception:
                db.session.rollback()
            return resp
        return wrapper
    return decorator

def require_perm(code):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = int(get_jwt_identity())
            user = User.query.get(user_id)
            if not user or not user.active or not user.has_perm(code):
                return jsonify({"error": "Permissão negada", "perm": code}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def extract_req():
    try:
        return {
            "path": request.path,
            "args": request.args.to_dict(),
            "json": request.json if isinstance(request.json, dict) else None
        }
    except Exception:
        return {}



# ==================
# Autenticação (2)
# ==================
@app.route("/")
def index():
    return render_template("login.html")


# --- LOGIN ---
@app.post("/auth/login")
@log_action("auth.login")
def login():
    data = request.json or {}

    if not data.get("username") or not data.get("password"):
        return jsonify({"error": "Usuário e senha são obrigatórios"}), 400

    user = User.query.filter_by(username=data.get("username")).first()
    if not user or not bcrypt.check_password_hash(user.password, data.get("password", "")):
        return jsonify({"error": "Credenciais inválidas"}), 401

    # Token com expiração (ex: 1h)
    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(hours=1)
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "active": user.active
        }
    }), 200


# --- LOGOUT ---
@app.post("/auth/logout")
@jwt_required()
@log_action("auth.logout")
def logout():
    # JWT é stateless → o frontend só precisa descartar o token
    return jsonify({"message": "Logout realizado com sucesso"}), 200


# --- USUÁRIO ATUAL ---
@app.get("/auth/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    u = User.query.get(user_id)
    if not u:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Montar permissões
    perms = []
    for ur in u.roles:
        perms += [rp.permission.code for rp in ur.role.permissions]

    return jsonify({
        "id": u.id,
        "username": u.username,
        "active": u.active,
        "roles": [ur.role.name for ur in u.roles],
        "permissions": sorted(list(set(perms)))
    }), 200


# ==================
# Admin / Núcleo (1)
# ==================
# CRUD Usuários, papéis e permissões; Config. de módulos; Logs; Dashboard

# --- Usuários ---
@app.post("/admin/users")
@require_perm("admin.users.create")
@log_action("admin.users.create", resource_type="User", details=lambda: request.json)
def admin_create_user():
    d = request.json or {}
    pw = bcrypt.generate_password_hash(d["password"]).decode()
    u = User(username=d["username"], password=pw, active=d.get("active", True))
    db.session.add(u); db.session.commit()
    return jsonify({"id": u.id, "username": u.username})

@app.get("/admin/users")
@require_perm("admin.users.view")
def admin_list_users():
    users = User.query.all()
    out = []
    for u in users:
        out.append({
            "id": u.id, "username": u.username, "active": u.active,
            "roles": [ur.role.name for ur in u.roles]
        })
    return jsonify(out)

@app.put("/admin/users/<int:uid>")
@require_perm("admin.users.update")
@log_action("admin.users.update", resource_type="User", details=lambda: request.json)
def admin_update_user(uid):
    u = User.query.get_or_404(uid)
    d = request.json or {}
    if "password" in d and d["password"]:
        u.password = bcrypt.generate_password_hash(d["password"]).decode()
    if "active" in d:
        u.active = bool(d["active"])
    db.session.commit()
    return jsonify({"message":"ok"})

@app.delete("/admin/users/<int:uid>")
@require_perm("admin.users.delete")
@log_action("admin.users.delete", resource_type="User")
def admin_delete_user(uid):
    u = User.query.get_or_404(uid)
    db.session.delete(u); db.session.commit()
    return jsonify({"message":"deleted"})

# --- Papéis e Permissões ---
@app.post("/admin/roles")
@require_perm("admin.roles.create")
def admin_create_role():
    d = request.json or {}
    r = Role(name=d["name"], description=d.get("description"))
    db.session.add(r); db.session.commit()
    return jsonify({"id": r.id, "name": r.name})

@app.put("/admin/roles/<int:rid>/permissions")
@require_perm("admin.roles.assign")
def admin_assign_perms(rid):
    d = request.json or {}
    r = Role.query.get_or_404(rid)
    r.permissions.clear()
    for code in d.get("permissions", []):
        p = Permission.query.filter_by(code=code).first()
        if p:
            rp = RolePermission(role=r, permission=p)
            db.session.add(rp)
    db.session.commit()
    return jsonify({"message":"ok"})

@app.post("/admin/users/<int:uid>/roles")
@require_perm("admin.users.assign_role")
def admin_assign_role(uid):
    u = User.query.get_or_404(uid)
    d = request.json or {}
    role = Role.query.filter_by(name=d["role"]).first_or_404()
    # evita duplicidade
    if not any(ur.role_id == role.id for ur in u.roles):
        db.session.add(UserRole(user=u, role=role))
        db.session.commit()
    return jsonify({"message":"ok"})

# --- Logs do sistema ---
@app.get("/admin/logs")
@require_perm("admin.logs.view")
def admin_logs():
    q = SystemLog.query.order_by(SystemLog.id.desc()).limit(500).all()
    return jsonify([{
        "id": l.id, "actor_id": l.actor_id, "action": l.action,
        "resource_type": l.resource_type, "resource_id": l.resource_id,
        "details": safe_json(l.details), "ip": l.ip, "created_at": l.created_at.isoformat()
    } for l in q])

# --- Dashboard Métricas (geral) ---
@app.get("/admin/dashboard")
@require_perm("admin.dashboard.view")
def admin_dashboard():
    return jsonify({
        "usuarios_ativos": User.query.filter_by(active=True).count(),
        "itens_estoque": Item.query.count(),
        "pedidos_abertos": Order.query.filter(Order.status!="finalizado").count(),
        "em_producao": Order.query.filter_by(status="producao").count(),
        "em_costura": SewingTask.query.filter_by(status="em_andamento").count(),
        "expedicoes_pendentes": Shipment.query.filter_by(status="pendente").count()
    })

# ==================
# Estoque (3)
# ==================
class Item(db.Model):
    __tablename__="items"
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(60), unique=True, nullable=False)
    nome = db.Column(db.String(120))
    prateleira = db.Column(db.String(30))
    posicao = db.Column(db.String(30))
    quantidade = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Movement(db.Model):
    __tablename__="movements"
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"))
    tipo = db.Column(db.String(20))          # entrada / saida / ajuste
    motivo = db.Column(db.String(40))        # venda / estoque / devolucao / outros
    quantidade = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"))

# Itens
@app.post("/estoque/itens")
@require_perm("estoque.itens.create")
@log_action("estoque.itens.create", resource_type="Item", details=lambda: request.json)
def item_create():
    d = request.json or {}
    it = Item(sku=d["sku"], nome=d.get("nome"), prateleira=d.get("prateleira"),
              posicao=d.get("posicao"), quantidade=int(d.get("quantidade",0)))
    db.session.add(it); db.session.commit()
    return jsonify({"id": it.id})

@app.get("/estoque/itens")
@require_perm("estoque.itens.view")
def item_list():
    q = Item.query.all()
    return jsonify([i_to_dict(x) for x in q])

@app.put("/estoque/itens/<int:iid>")
@require_perm("estoque.itens.update")
@log_action("estoque.itens.update", resource_type="Item", details=lambda: request.json)
def item_update(iid):
    it = Item.query.get_or_404(iid)
    d = request.json or {}
    for f in ["nome","prateleira","posicao"]:
        if f in d: setattr(it, f, d[f])
    db.session.commit()
    return jsonify({"message":"ok"})

# Movimentações (entrada/saída/ajuste)
@app.post("/estoque/movimentar")
@require_perm("estoque.movimentacoes.create")
@log_action("estoque.movimentacoes.create", resource_type="Movement", details=lambda: request.json)
def movimentar():
    d = request.json or {}
    it = Item.query.filter_by(sku=d["sku"]).first_or_404()
    qtd = int(d["quantidade"])
    tipo = d["tipo"] # entrada/saida/ajuste
    if tipo == "entrada": it.quantidade += qtd
    elif tipo == "saida": it.quantidade -= qtd
    elif tipo == "ajuste": it.quantidade = qtd
    else: return jsonify({"error":"tipo inválido"}), 400
    mv = Movement(item_id=it.id, tipo=tipo, motivo=d.get("motivo","outros"),
                  quantidade=qtd, actor_id=current_user_id())
    db.session.add(mv); db.session.commit()
    return jsonify({"saldo_atual": it.quantidade})

# Relatório de estoque detalhado
@app.get("/estoque/relatorios/detalhado")
@require_perm("estoque.relatorios.view")
def estoque_relatorio():
    itens = Item.query.all()
    movs = Movement.query.order_by(Movement.created_at.desc()).limit(500).all()
    return jsonify({
        "itens":[i_to_dict(x) for x in itens],
        "movimentacoes":[m_to_dict(m) for m in movs]
    })

# ==================
# Pedidos (4)
# ==================
class Order(db.Model):
    __tablename__="orders"
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(60), nullable=False)
    quantidade = db.Column(db.Integer, default=1)
    origem = db.Column(db.String(40))          # shopee / mercado_livre / interno
    status = db.Column(db.String(30), default="aberto")  # aberto -> pedidos.check -> producao -> costura -> expedicao -> finalizado
    progresso = db.Column(db.Integer, default=0)
    data_envio = db.Column(db.Date)            # para fila (exibição)
    envio_modalidade = db.Column(db.String(30))# motoboy/correios/etc
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class OrderHistory(db.Model):
    __tablename__="order_history"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    descricao = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    actor_id = db.Column(db.Integer, db.ForeignKey("users.id"))

def baixa_automatica_estoque(sku, qtd):
    item = Item.query.filter_by(sku=sku).first()
    if not item or item.quantidade < qtd:
        return {"ok": False, "mensagem":"Sem saldo ou item inexistente"}
    item.quantidade -= qtd
    mv = Movement(item_id=item.id, tipo="saida", motivo="venda", quantidade=qtd, actor_id=current_user_id())
    db.session.add(mv)
    return {"ok": True, "prateleira": item.prateleira, "posicao": item.posicao, "saldo": item.quantidade}

@app.post("/pedidos")
@require_perm("pedidos.create")
@log_action("pedidos.create", resource_type="Order", details=lambda: request.json)
def order_create():
    d = request.json or {}
    o = Order(
        sku=d["sku"], quantidade=int(d.get("quantidade",1)),
        origem=d.get("origem","interno"),
        data_envio=to_date(d.get("data_envio")),
        envio_modalidade=d.get("envio_modalidade")
    )
    db.session.add(o); db.session.flush()
    # Integração com estoque (posições + baixa automática quando solicitado)
    auto = bool(d.get("baixa_automatica", True))
    pos = None
    if auto:
        r = baixa_automatica_estoque(o.sku, o.quantidade)
        if r["ok"]:
            pos = f"{r['prateleira']} - {r['posicao']}"
            hist = OrderHistory(order_id=o.id, descricao=f"Baixa automática realizada. Local: {pos}", actor_id=current_user_id())
            db.session.add(hist)
        else:
            hist = OrderHistory(order_id=o.id, descricao=f"Sem estoque para {o.sku}", actor_id=current_user_id())
            db.session.add(hist)
    db.session.commit()
    return jsonify({"id": o.id, "posicao": pos})

@app.post("/pedidos/<int:oid>/check")
@require_perm("pedidos.check")
@log_action("pedidos.check", resource_type="Order")
def order_check(oid):
    o = Order.query.get_or_404(oid)
    o.status = "producao"
    o.progresso = 10
    db.session.add(OrderHistory(order_id=o.id, descricao="Pedido checado e enviado para Produção", actor_id=current_user_id()))
    # cria tarefa de produção e costura (fila)
    t = ProductionTask(order_id=o.id, status="em_fila")
    db.session.add(t)
    s = SewingTask(order_id=o.id, status="em_andamento")  # entra na fila de costura
    db.session.add(s)
    db.session.commit()
    return jsonify({"message":"pedido para produção e costura"})

@app.get("/pedidos")
@require_perm("pedidos.view")
def order_list():
    q = Order.query.order_by(Order.id.desc()).limit(200).all()
    return jsonify([o_to_dict(x) for x in q])

@app.get("/pedidos/historico/<int:oid>")
@require_perm("pedidos.view")
def order_history(oid):
    h = OrderHistory.query.filter_by(order_id=oid).order_by(OrderHistory.id.desc()).all()
    return jsonify([{"id":x.id,"descricao":x.descricao,"created_at":x.created_at.isoformat()} for x in h])

# ==================
# Banco de Imagens / Impressoras (5)
# ==================
class Printer(db.Model):
    __tablename__="printers"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(60), unique=True)

class ImageAsset(db.Model):
    __tablename__="image_assets"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(140))
    caminho = db.Column(db.String(240)) # armazene path/S3; aqui é só metadado
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PrintJob(db.Model):
    __tablename__="print_jobs"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    image_id = db.Column(db.Integer, db.ForeignKey("image_assets.id"))
    printer_id = db.Column(db.Integer, db.ForeignKey("printers.id"))
    status = db.Column(db.String(30), default="pendente") # pendente/em_execucao/concluido
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.post("/imagens/upload")
@require_perm("imagens.upload")
@log_action("imagens.upload", resource_type="ImageAsset", details=lambda: request.json)
def upload_imagem():
    d = request.json or {}
    img = ImageAsset(nome=d["nome"], caminho=d.get("caminho"))
    db.session.add(img); db.session.commit()
    return jsonify({"id": img.id})

@app.post("/impressao/atribuir")
@require_perm("impressao.create")
def atribuir_impressora():
    d = request.json or {}
    job = PrintJob(order_id=d["order_id"], image_id=d["image_id"], printer_id=d["printer_id"])
    db.session.add(job); db.session.commit()
    return jsonify({"id": job.id})

@app.get("/impressao/historico")
@require_perm("impressao.view")
def impressao_historico():
    jobs = PrintJob.query.order_by(PrintJob.id.desc()).limit(200).all()
    return jsonify([{
        "id":j.id, "order_id":j.order_id, "image_id":j.image_id,
        "printer_id":j.printer_id, "status":j.status, "created_at":j.created_at.isoformat()
    } for j in jobs])

# ==================
# Produção (6)
# ==================
class ProductionTask(db.Model):
    __tablename__="production_tasks"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    status = db.Column(db.String(30), default="em_fila") # em_fila/em_andamento/concluida/cancelada
    progresso = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.get("/producao/fila")
@require_perm("producao.view")
def producao_fila():
    # mostra sku + data_envio e destaque motoboy
    tasks = db.session.query(ProductionTask, Order).join(Order, Order.id==ProductionTask.order_id)\
            .order_by(ProductionTask.id.asc()).all()
    out=[]
    for t,o in tasks:
        out.append({
            "task_id": t.id, "order_id": o.id, "sku": o.sku, "qtd": o.quantidade,
            "data_envio": o.data_envio.isoformat() if o.data_envio else None,
            "envio_modalidade": o.envio_modalidade,
            "destaque": True if (o.envio_modalidade or "").lower()=="motoboy" else False,
            "status_task": t.status, "progresso": t.progresso
        })
    return jsonify(out)

@app.post("/producao/<int:tid>/progresso")
@require_perm("producao.update")
def producao_progresso(tid):
    d = request.json or {}
    t = ProductionTask.query.get_or_404(tid)
    t.progresso = int(d.get("progresso", t.progresso))
    t.status = d.get("status", t.status)
    if t.status == "concluida":
        o = Order.query.get(t.order_id)
        o.status = "costura"
        o.progresso = 60
        db.session.add(OrderHistory(order_id=o.id, descricao="Produção concluída; enviado para Costura", actor_id=current_user_id()))
    db.session.commit()
    return jsonify({"message":"ok"})

# ==================
# Costura (7)
# ==================
class SewingTask(db.Model):
    __tablename__="sewing_tasks"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    assigned_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    categoria_visivel = db.Column(db.String(20)) # PV, PC, etc (controle de visualização por usuário)
    status = db.Column(db.String(30), default="em_andamento") # em_andamento/concluida
    checks = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

@app.get("/costura/fila")
@require_perm("costura.view")
def costura_fila():
    tasks = db.session.query(SewingTask, Order).join(Order, Order.id == SewingTask.order_id)\
        .order_by(SewingTask.id.asc()).all()
    return jsonify([{
        "task_id":t.id, "order_id":o.id, "sku":o.sku, "status":t.status,
        "checks":t.checks, "categoria_visivel":t.categoria_visivel
    } for t,o in tasks])

@app.post("/costura/<int:tid>/check")
@require_perm("costura.check")
def costura_check(tid):
    t = SewingTask.query.get_or_404(tid)
    t.checks += 1
    if request.json and request.json.get("finalizar"):
        t.status = "concluida"
        o = Order.query.get(t.order_id)
        o.status = "expedicao"; o.progresso = 85
        db.session.add(OrderHistory(order_id=o.id, descricao="Costura concluída; enviado para Expedição", actor_id=current_user_id()))
    db.session.commit()
    return jsonify({"checks": t.checks, "status": t.status})

@app.get("/costura/eficiencia")
@require_perm("costura.relatorios.view")
def costura_eficiencia():
    # relatórios simples por usuário (quantos checks)
    rows = db.session.query(SewingTask.assigned_user_id, db.func.sum(SewingTask.checks))\
        .group_by(SewingTask.assigned_user_id).all()
    out=[]
    for uid, total in rows:
        user = User.query.get(uid) if uid else None
        out.append({"usuario": user.username if user else None, "checks": int(total or 0)})
    return jsonify(out)

# ==================
# Expedição (8)
# ==================
class Shipment(db.Model):
    __tablename__="shipments"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"))
    etapa1_sku_ok = db.Column(db.Boolean, default=False)
    etapa2_qtd_ok = db.Column(db.Boolean, default=False)
    etapa3_nf_ok = db.Column(db.Boolean, default=False)
    nf_numero = db.Column(db.String(40))
    status = db.Column(db.String(20), default="pendente") # pendente/finalizado
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@app.post("/expedicao/conferencia")
@require_perm("expedicao.conferencia")
def expedicao_conferencia():
    d = request.json or {}
    shp = Shipment(order_id=d["order_id"],
                   etapa1_sku_ok=bool(d.get("etapa1_sku_ok")),
                   etapa2_qtd_ok=bool(d.get("etapa2_qtd_ok")),
                   etapa3_nf_ok=bool(d.get("etapa3_nf_ok")),
                   nf_numero=d.get("nf_numero"))
    if shp.etapa1_sku_ok and shp.etapa2_qtd_ok and shp.etapa3_nf_ok:
        shp.status="finalizado"
        o = Order.query.get(shp.order_id)
        o.status="finalizado"; o.progresso=100
        db.session.add(OrderHistory(order_id=o.id, descricao="Expedição finalizada", actor_id=current_user_id()))
    db.session.add(shp); db.session.commit()
    return jsonify({"id": shp.id, "status": shp.status})

@app.get("/expedicao/historico")
@require_perm("expedicao.view")
def expedicao_hist():
    q = Shipment.query.order_by(Shipment.id.desc()).limit(200).all()
    return jsonify([{
        "id":s.id,"order_id":s.order_id,"nf":s.nf_numero,"status":s.status,
        "created_at":s.created_at.isoformat()
    } for s in q])

# ==================
# Métricas por módulo (cards do dashboard admin)
# ==================
@app.get("/metricas")
@require_perm("admin.dashboard.view")
def metricas():
    return jsonify({
        "estoque": {
            "itens": Item.query.count(),
            "movimentacoes_24h": Movement.query.filter(Movement.created_at > datetime.utcnow()-timedelta(days=1)).count()
        },
        "pedidos": {
            "abertos": Order.query.filter_by(status="aberto").count(),
            "producao": Order.query.filter_by(status="producao").count(),
            "costura": Order.query.filter_by(status="costura").count(),
            "expedicao": Order.query.filter_by(status="expedicao").count(),
            "finalizados_7d": Order.query.filter(
                Order.status=="finalizado",
                Order.created_at > datetime.utcnow()-timedelta(days=7)
            ).count()
        },
        "impressao": {
            "jobs_pendentes": PrintJob.query.filter_by(status="pendente").count(),
            "jobs_concluidos_7d": PrintJob.query.filter(
                PrintJob.status=="concluido",
                PrintJob.created_at > datetime.utcnow()-timedelta(days=7)
            ).count()
        },
        "costura": {
            "tarefas": SewingTask.query.count(),
            "em_andamento": SewingTask.query.filter_by(status="em_andamento").count()
        },
        "expedicao": {
            "pendentes": Shipment.query.filter_by(status="pendente").count(),
            "finalizados_7d": Shipment.query.filter(
                Shipment.status=="finalizado",
                Shipment.created_at > datetime.utcnow()-timedelta(days=7)
            ).count()
        }
    })

# ==================
# Helpers / Util
# ==================
def safe_json(txt):
    try:
        return json.loads(txt) if txt else None
    except Exception:
        return txt

def to_date(s):
    if not s: return None
    try:
        return datetime.fromisoformat(s).date()
    except Exception:
        return None

def current_user_id():
    try:
        user_id = get_jwt_identity()
        return int(user_id) if user_id else None
    except Exception:
        return None

def i_to_dict(i: Item):
    return {
        "id": i.id, "sku": i.sku, "nome": i.nome, "prateleira": i.prateleira,
        "posicao": i.posicao, "quantidade": i.quantidade, "created_at": i.created_at.isoformat()
    }

def m_to_dict(m: Movement):
    return {
        "id": m.id, "item_id": m.item_id, "tipo": m.tipo, "motivo": m.motivo,
        "quantidade": m.quantidade, "created_at": m.created_at.isoformat(), "actor_id": m.actor_id
    }

def o_to_dict(o: Order):
    return {
        "id":o.id, "sku":o.sku, "quantidade":o.quantidade, "origem":o.origem,
        "status":o.status, "progresso":o.progresso,
        "data_envio": o.data_envio.isoformat() if o.data_envio else None,
        "envio_modalidade": o.envio_modalidade, "created_at": o.created_at.isoformat()
    }

# ==================
# Seed (cria admin, permissões padrão, impressora exemplo)
# ==================
ALL_PERMS = [
    # Admin/Núcleo
    "admin.dashboard.view",
    "admin.logs.view",
    "admin.users.view","admin.users.create","admin.users.update","admin.users.delete","admin.users.assign_role",
    "admin.roles.create","admin.roles.assign",
    # Estoque
    "estoque.itens.view","estoque.itens.create","estoque.itens.update",
    "estoque.movimentacoes.create",
    "estoque.relatorios.view",
    # Pedidos
    "pedidos.view","pedidos.create","pedidos.check",
    # Banco de Imagens / Impressão
    "imagens.upload","impressao.create","impressao.view",
    # Produção
    "producao.view","producao.update",
    # Costura
    "costura.view","costura.check","costura.relatorios.view",
    # Expedição
    "expedicao.view","expedicao.conferencia"
]

@app.post("/seed")
def seed():
    db.create_all()
    # cria permissões
    for code in ALL_PERMS:
        if not Permission.query.filter_by(code=code).first():
            db.session.add(Permission(code=code, description=code))
    db.session.commit()
    # role admin
    admin = Role.query.filter_by(name="admin").first()
    if not admin:
        admin = Role(name="admin", description="Acesso total")
        db.session.add(admin); db.session.commit()
    # vincula todas permissões ao admin
    admin.permissions.clear()
    for p in Permission.query.all():
        db.session.add(RolePermission(role=admin, permission=p))
    # cria usuário admin
    if not User.query.filter_by(username="admin").first():
        u = User(username="admin", password=bcrypt.generate_password_hash("admin123").decode())
        db.session.add(u); db.session.commit()
        db.session.add(UserRole(user=u, role=admin))
    # cria impressora exemplo
    if not Printer.query.first():
        db.session.add(Printer(nome="Impressora-01"))
    db.session.commit()
    return jsonify({"message":"seed ok", "admin_login":"admin/admin123"})

# ==========
# Start
# ==========
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
