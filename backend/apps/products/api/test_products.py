import pytest
from io import BytesIO
from PIL import Image
from rest_framework.test import APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.products.models import Product
from apps.categories.models import Category
from apps.ingredients.models import Ingredient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="tester",
        email="tester@test.com",
        name="Tester User",
        password="pass12345"
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client

@pytest.mark.django_db
def test_create_product_with_translations_and_categories(auth_client):
    # Primero crea categorías
    cat1 = Category.objects.create()
    cat1.set_current_language('es')
    cat1.name = "Categoría ES"
    cat1.save()
    cat1.set_current_language('en')
    cat1.name = "Category EN"
    cat1.save()

    url = reverse('products-list')
    payload = {
        "translations": {
            "es": {
                "name": "Producto ES",
                "description": "Descripción ES"
            },
            "en": {
                "name": "Product EN",
                "description": "Description EN"
            }
        },
        "price": "10.00",
        "stock": 50,
        "available": True,
        "categories": [cat1.pk],
        "image": None
    }
    response = auth_client.post(url, payload, format='json')
    assert response.status_code == 201
    data = response.json()
    assert 'translations' in data
    # Check that at least one translation exists
    translations = data['translations']
    assert len(translations) > 0
    # Check that categories were assigned
    assert cat1.pk in data['categories']


@pytest.mark.django_db
def test_list_products_only_available(api_client):
    # Producto disponible
    plate1 = Product.objects.create(price=5, stock=10, available=True)
    plate1.set_current_language('es')
    plate1.name = "Disponible ES"
    plate1.save()
    # Producto no disponible
    plate2 = Product.objects.create(price=5, stock=10, available=False)
    plate2.set_current_language('es')
    plate2.name = "No disponible ES"
    plate2.save()

    # Filter by available=true
    url = reverse('products-list')
    response = api_client.get(url, {'available': 'true'})
    assert response.status_code == 200
    data = response.json()
    # Handle paginated response
    results = data.get('results', data) if isinstance(data, dict) else data
    names = [item['translations']['es']['name'] for item in results]
    assert "Disponible ES" in names
    assert "No disponible ES" not in names


@pytest.mark.django_db
def test_retrieve_product(api_client):
    plate = Product.objects.create(price=20, stock=5, available=True)
    plate.set_current_language('es')
    plate.name = "Plato ES"
    plate.description = "Desc ES"
    plate.save()

    url = reverse('products-detail', args=[plate.pk])
    response = api_client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert data['translations']['es']['name'] == "Plato ES"


@pytest.mark.django_db
def test_update_product(auth_client):
    plate = Product.objects.create(price=30, stock=20, available=True)
    plate.set_current_language('es')
    plate.name = "Plato ES"
    plate.description = "Desc ES"
    plate.save()

    cat = Category.objects.create()
    cat.set_current_language('es')
    cat.name = "Categoria ES"
    cat.save()

    url = reverse('products-detail', args=[plate.pk])
    payload = {
        "translations": {
            "es": {
                "name": "Plato Editado ES",
                "description": "Desc editada ES"
            },
            "en": {
                "name": "Edited Plate EN",
                "description": "Edited desc EN"
            }
        },
        "price": "50.00",
        "stock": 100,
        "available": True,
        "categories": [cat.pk],
        "image": None
    }
    response = auth_client.put(url, payload, format='json')
    assert response.status_code == 200
    data = response.json()
    assert 'translations' in data
    # Check that at least one translation exists
    translations = data['translations']
    assert len(translations) > 0
    # Check that categories were updated
    assert cat.pk in data['categories']


@pytest.mark.django_db
def test_partial_update_product(auth_client):
    plate = Product.objects.create(price=15, stock=30, available=True)
    plate.set_current_language('es')
    plate.name = "Plato ES"
    plate.description = "Desc ES"
    plate.save()

    url = reverse('products-detail', args=[plate.pk])
    payload = {
        "translations": {
            "es": {
                "name": "Plato Parcial"
            }
        }
    }
    response = auth_client.patch(url, payload, format='json')
    assert response.status_code == 200
    data = response.json()
    assert data['translations']['es']['name'] == "Plato Parcial"


@pytest.mark.django_db
def test_delete_product(auth_client):
    plate = Product.objects.create(price=10, stock=10, available=True)
    plate.set_current_language('es')
    plate.name = "Plato ES"
    plate.save()

    url = reverse('products-detail', args=[plate.pk])
    response = auth_client.delete(url)
    assert response.status_code == 204
    assert Product.objects.filter(pk=plate.pk).count() == 0


@pytest.mark.django_db
def test_create_product_with_formdata_flat_fields(auth_client):
    """Test creating product using form-data format with flat translation fields."""
    # Create category
    cat1 = Category.objects.create()
    cat1.set_current_language('es')
    cat1.name = "Categoría ES"
    cat1.save()

    # Create ingredients
    ing1 = Ingredient.objects.create()
    ing1.set_current_language('es')
    ing1.name = "Ingrediente 1"
    ing1.save()

    ing2 = Ingredient.objects.create()
    ing2.set_current_language('es')
    ing2.name = "Ingrediente 2"
    ing2.save()

    # Create a simple test image
    image = Image.new('RGB', (100, 100), color='red')
    image_io = BytesIO()
    image.save(image_io, format='JPEG')
    image_io.seek(0)
    image_file = SimpleUploadedFile(
        "test_image.jpg",
        image_io.getvalue(),
        content_type="image/jpeg"
    )

    url = reverse('products-list')

    # Use flat fields format (form-data style)
    payload = {
        "name_en": "Product EN",
        "name_es": "Producto ES",
        "description_en": "Description EN",
        "description_es": "Descripción ES",
        "price": "15.50",
        "stock": 100,
        "available": True,
        "be_extra": False,
        "categories": f"{cat1.pk}",  # Comma-separated string
        "ingredients": f"{ing1.pk},{ing2.pk}",  # Comma-separated string
        "image": image_file
    }

    response = auth_client.post(url, payload, format='multipart')

    assert response.status_code == 201
    data = response.json()

    # Verify translations were created correctly
    assert 'translations' in data
    assert data['translations']['es']['name'] == "Producto ES"
    assert data['translations']['en']['name'] == "Product EN"
    assert data['translations']['es']['description'] == "Descripción ES"
    assert data['translations']['en']['description'] == "Description EN"

    # Verify relationships
    assert cat1.pk in data['categories']

    # Verify image was uploaded
    assert data['image'] is not None
    assert 'test_image' in data['image']


#TODO revisar test en todos los modelos de la app