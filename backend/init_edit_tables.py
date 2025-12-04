from backend.database import engine, Base
from backend.domain_models import EditSession, SourceImage, GeneratedImage

def main():
    print("Creating edit session tables")
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    main()