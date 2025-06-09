# AWS2_Sintesis-Project

Software para la gestión de listas de videojuegos y busqueda de información de esto.

## Instalación

### Requisitos previos

Asegúrate de tener instalados los siguientes programas:

- **Git**: Para clonar el repositorio.
- **Python 3**: Para ejecutar el backend.
- **Virtualenv**: Para crear un entorno virtual.

Instala los paquetes necesarios en sistemas basados en Debian/Ubuntu:

```bash
sudo apt update
sudo apt install python3-venv git
```

Instala las bibliotecas necesarias para trabajar con MySQL y otros requisitos del sistema:

```bash
sudo apt install libmysqlclient-dev python3-dev python3-mysqldb gcc pkgconf
```

Instala las dependencias del proyecto especificadas en env_requirements.txt:

```bash
(env) $ pip install -r env_requirements.txt
```

Configurar la base de datos y añadido un superusuario:

```bash
(env) $ cp .env.example .env
(env) $ ./manage.py migrate
(env) $ ./manage.py createsuperuser
```

Para pruebas en local, puedes poner en marxa el servidor de desarrollo de esta manera:

```bash
(env) $ ./manage.py runserver
```

Si hacemos eso último podemos acceder al panel de administración en: http://localhost:8000/admin/

## Frontend React

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu sistema:

- [Node.js](https://nodejs.org/) (v16 o superior)
- [npm](https://www.npmjs.com/) (incluido con Node.js) o [Yarn](https://yarnpkg.com/) (opcional)

Para tener esto preparado tendremos que entrar al directorio de React y instalar las dependencias:

```bash
cd your-repository
npm install
```

Para pruebas en local:

```bash
npm run dev
```
Si no se ha cambiado nada, este servidor de prueba se abrirá en: http://localhost:5173


Para preparar los archivos de producción:

```bash
npm run build
```


## API

Para poder accedir a algunas funcionalidades se tendrán que tener un cuenta y iniciar sesión, esto devolverá un token que funciona así:

GET /api/token
paràmetres:
  * email
  * password

Exemples:
    curl "localhost:8000/api/token/" -i -X GET -u admin:admin123

## Configuración del Apache Server para que funcione Django en producción

Para que Django funcione, necesitarás tener wsgi habilitado. Primero, deberá instalar el paquete:

```bash
sudo apt install libapache2-mod-wsgi-py3
```

Luego, deberá habilitarlo:

```bash
a2enmod wsgi
```

Después, deberá modificar los archivos de configuración de sus sitios específicos (el valor predeterminado sería 000-default.conf) de la siguiente manera:

    # Django conf
    #Alias /media/ /var/www/<folderWithProject>/media/
    Alias /static/ /var/www/<folderWithProject>/static/

    <Directory /var/www/<folderWithProject>/static>
        Require all granted
    </Directory>

    <Directory /var/www/<folderWithProject>/media>
        Options -Indexes
        Require all granted
    </Directory>

    WSGIDaemonProcess example.com python-home=/var/www/<folderWithProject>/env python-path=/var/www/<folderWithProject>/
    WSGIProcessGroup example.com

    WSGIScriptAlias / /var/www/<folderWithProject>/gamevault/wsgi.py process-group=example.com

    #ARREGLO CLOUDFARE
    WSGIPassAuthorization On

    <Directory /var/www/<folderWithProject>/gamevault>
    <Files wsgi.py>
    Require all granted
    </Files>
    </Directory>
