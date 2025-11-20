
# 🌍 Translation Support (`django-parler`)

This project uses `django-parler` to enable multilingual content management in the **Categories** and **Products (Plates)** models.

## 📦 Where is it used?

Currently, translations are enabled only in these apps:

- `apps/categories/`
- `apps/products/`

They are not available (for now) in:

- `apps/users/`
- `apps/company/`

---

## ⚙️ How `django-parler` works

`django-parler` allows you to translate specific fields of a model into multiple languages without duplicating the entire instance.

### Example (Category model):

```python
from parler.models import TranslatableModel, TranslatedFields

class Category(TranslatableModel):
    translations = TranslatedFields(
        name=models.CharField(max_length=100),
    )
```

This design allows you to have a single category with multiple translations of `name`, depending on the current system language.

---

## 🌐 How to translate content

### 1. In the **Django admin panel**

- Tabs for each available language will appear above the form.
- You can switch languages and fill in the translatable fields.

### 2. Using the API (from frontend or tests)

#### Create a category with translations

```json
POST /api/categories/
{
  "translations": {
    "es": {"name": "Entrantes"},
    "en": {"name": "Starters"}
  }
}
```

#### Read a category (automatically in the active language)

```http
GET /api/categories/?lang=en
```

Will return:

```json
{
  "id": 1,
  "name": "Starters"
}
```

---

## 🌍 Language configuration

In `settings.py`:

```python
LANGUAGES = [
    ("es", "Español"),
    ("en", "English"),
]

PARLER_LANGUAGES = {
    None: (
        {'code': 'es'},
        {'code': 'en'},
    ),
    'default': {
        'fallbacks': ['es'],
        'hide_untranslated': False,
    }
}
```

You can easily add more languages.

---

## 🧪 Translation testing

In tests with `pytest`, you can set the active language:

```python
category.set_current_language('es')
category.name = "Entrantes"
category.save()
```

---

## ❗ Important notes

- If a translation is not found for a language, the *fallback* (`es` by default) is used.
- If `hide_untranslated = True`, objects without an active translation will be hidden.
- You can access all languages using `.get_available_languages()` on an instance.
