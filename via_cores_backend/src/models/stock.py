from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class StockItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    shelf = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Disponível')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<StockItem {self.sku}>'

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'quantity': self.quantity,
            'shelf': self.shelf,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sku = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # ENTRADA, SAÍDA, AJUSTE, etc.
    shelf = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(255), nullable=True)

    user = db.relationship('User', backref=db.backref('transactions', lazy=True))

    def __repr__(self):
        return f'<Transaction {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'user': self.user.username if self.user else None,
            'sku': self.sku,
            'quantity': self.quantity,
            'type': self.type,
            'shelf': self.shelf,
            'reason': self.reason
        }

