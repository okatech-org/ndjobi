"""
Configuration du système de logging
Support JSON logging pour production et formatage coloré pour développement
"""

import logging
import sys
from typing import Any, Dict
from pythonjsonlogger import jsonlogger

from app.config import settings


class ColoredFormatter(logging.Formatter):
    """Formatter avec couleurs pour le développement"""
    
    COLORS = {
        'DEBUG': '\033[36m',
        'INFO': '\033[32m',
        'WARNING': '\033[33m',
        'ERROR': '\033[31m',
        'CRITICAL': '\033[35m',
    }
    RESET = '\033[0m'
    
    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{log_color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_logging():
    """Configure le système de logging global"""
    
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    handler = logging.StreamHandler(sys.stdout)
    
    if settings.log_format == "json" or settings.is_production:
        formatter = jsonlogger.JsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s',
            rename_fields={
                "levelname": "level",
                "asctime": "timestamp"
            }
        )
    else:
        formatter = ColoredFormatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    handler.setFormatter(formatter)
    root_logger.addHandler(handler)
    
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    
    if settings.is_development:
        logging.getLogger("app").setLevel(logging.DEBUG)

