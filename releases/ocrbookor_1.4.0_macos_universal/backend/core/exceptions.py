"""
OCRBookor - Exceptions Métier
"""

class OCRBookorException(Exception):
    """Exception de base pour toutes les erreurs métier d'OCRBookor"""
    pass

class OCREngineNotInstalledError(OCRBookorException):
    """Levée lorsqu'un moteur OCR requis n'est pas installé sur la machine hôte"""
    pass

class LanguageNotAvailableError(OCRBookorException):
    """Levée lorsque le modèle linguistique (traineddata) n'est pas présent"""
    pass

class InvalidPDFError(OCRBookorException):
    """Levée lorsque le fichier PDF est corrompu, protégé par mot de passe ou non conforme"""
    pass

class StorageError(OCRBookorException):
    """Erreur de persistance ou d'accès au système de fichiers"""
    pass

class ProjectNotFoundError(OCRBookorException):
    """Projet demandé introuvable dans la base de données"""
    pass
