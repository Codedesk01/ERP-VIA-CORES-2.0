from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db
import json

class ShippingPackage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), nullable=False)
    marketplace = db.Column(db.String(100), nullable=False)
    tracking_code = db.Column(db.String(100), nullable=True)
    invoice = db.Column(db.String(100), nullable=True)
    customer = db.Column(db.String(255), nullable=True)
    sku_list = db.Column(db.Text, nullable=False)  # JSON array
    status = db.Column(db.String(50), nullable=False, default='Preparando')
    sent_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    shipped_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref=db.backref('shipped_packages', lazy=True))

    def get_sku_list(self):
        return json.loads(self.sku_list) if self.sku_list else []

    def set_sku_list(self, sku_list):
        self.sku_list = json.dumps(sku_list)

    def __repr__(self):
        return f'<ShippingPackage {self.order_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'marketplace': self.marketplace,
            'tracking_code': self.tracking_code,
            'invoice': self.invoice,
            'customer': self.customer,
            'sku_list': self.get_sku_list(),
            'status': self.status,
            'sent_by': self.user.username if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'shipped_at': self.shipped_at.isoformat() if self.shipped_at else None
        }

