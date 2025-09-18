from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class ProductionItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    printer = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pendente')
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('production_items', lazy=True))

    def __repr__(self):
        return f'<ProductionItem {self.sku}>'

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'sku': self.sku,
            'quantity': self.quantity,
            'printer': self.printer,
            'status': self.status,
            'assigned_to': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class SewingTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    production_item_id = db.Column(db.Integer, db.ForeignKey('production_item.id'), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    status = db.Column(db.String(50), nullable=False, default='Pendente')
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    paused_time = db.Column(db.Integer, nullable=False, default=0)  # em segundos
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    production_item = db.relationship('ProductionItem', backref=db.backref('sewing_tasks', lazy=True))
    user = db.relationship('User', backref=db.backref('sewing_tasks', lazy=True))

    def __repr__(self):
        return f'<SewingTask {self.sku}>'

    def to_dict(self):
        return {
            'id': self.id,
            'production_item_id': self.production_item_id,
            'sku': self.sku,
            'quantity': self.quantity,
            'status': self.status,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'paused_time': self.paused_time,
            'user': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

