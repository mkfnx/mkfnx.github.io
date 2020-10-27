---
layout: post
title: Usando datos del API de Facebook en tu bot de Messenger
---

Este tutorial muestra cómo crear un servicio de Django que obtenga información del Graph API de Facebook para que sea consumida por un bot de Messenger.
El código de demo está disponible en GitHub y el proyecto de muestra se puede probar en este bot.

## Descripción del Proyecto
El proyecto que mostramos en este tutorial es un bot de Messenger que ayuda a los miembros de nuestro grupo de Facebook de Developer Circles a descubrir el contenido más relevante del grupo. Este proyecto obtiene información del grupo de Facebook usando el Graph API, posteriormente analiza la información y finalmente la expone a través de una respuesta JSON para que pueda mostrarse en un bot de Messenger.

![Group API response received in Messenger](https://i.ibb.co/dLDDhmB/Screen-Shot-2020-10-26-at-4-56-22.png)

El siguiente diagrama muestra una vista básica de los componentes del proyecto. Nos enfocaremos en el lado derecho de la imagen. En particular en el `Content Parser Service` el cual es el encargado de obtener y procesar la información del API y de entregarla en formato JSON. Este servicio puede estar hosteado en el mismo servidor que el bot o en uno diferente, lo cual facilita su integración. 

![Bot server diagram](https://i.ibb.co/4PD19DX/Graph-Api-Bot-Diagram.png)

## Pre-requisitos
* Python y pipenv instalados.
* Familiaridad con la biblioteca requests de Python.
* Saber cómo crear proyectos de Django y familiaridad con conceptos de Django como views, responses y templates.
* Saber cómo configurar un bot de Messenger en cualquier plataforma que permita consumir un servicio web o API. En este tutorial usaremos Chatfuel.

## Configurando el ambiente virtual usando pipenv
Primero, creamos una nueva carpeta para nuestro proyecto y nos movemos dentro de él
``` bash
mkdir fb_groups_api_for_messenger && cd fb_groups_api_for_messenger
```
Después usamos pipenv para instalar Django
``` bash
pipenv install django
```
Luego activamos nuestro ambiente virtual
``` bash
pipenv shell
```
Ahora creamos nuestro proyecto de Django
``` bash
django-admin startproject fb_groups_api_for_messenger
```
Y finalmente creamos una app para nuestro proyecto
``` bash
python manage.py startapp fb_group_data
```

## Configurando el proyecto de Django
Con nuestro proyecto Django ya configurado agregaremos algunas urls, una es para completar el proceso de autenticación de Facebook y las otras son para que el usuario seleccione el grupo y la información que desea obtener. 
Estas urls se agregan al archivo de urls de la app `fb_group_data`.
``` python
urlpatterns = [  
    path('fb_login_redirect', views.fb_login_redirect, name='fb_login_redirect'),  
    path('', views.home, name='home'),  
    path('group/<int:group_id>', views.group, name='group'),  
    path('group/<int:group_id>/weekly_summary?group_name=<str:group_name>'  
     '&format=<str:resp_format>', views.group_weekly_summary,  
      name='group_weekly_summary'),
```
En nuestras urls usamos estos parámetros:
* `group_id`: Para saber de que grupo obtendremos info.
* `group_name`: Se usa como etiqueta en una vista HTML.
* `resp_format`: Para indicar el formato de respuesta deseado, html o json.

Y ahora incluimos estas urls en el archivo de urls del proyecto
``` python
urlpatterns = [
    path('', include('fb_group_data.urls', namespace='fb')),
```

Luego agregamos las views correspondientes a estas urls, en las siguientes secciones describiremos a detalle cómo funcionan estas views.
``` python
def fb_login_redirect(request):

@login_required(login_url=settings.FB_LOGIN_URL)  
def home(request):

@login_required(login_url=settings.FB_LOGIN_URL)  
def group(request, group_id):

@login_required(login_url=settings.FB_LOGIN_URL)  
def group_weekly_summary(request, group_id, group_name, resp_format='html'):
```

No olvides ejecutar las migraciones de Django para que puedas ejecutar y probar el proyecto.
```
python manage.py migrate
```

### Settings y .env
Los valores a los que se hace referencia con el prefijo `settings` están definidos en el archivo de settings de Django y algunos de ellos se importan usando la biblioteca `dotenv`, de esta forma podemos mantener está información segura en nuestro servidor y evitar exponerla cuando enviemos nuestro código a servidores públicos como GitHub.
``` python
import os
from pathlib import Path
from dotenv import load_dotenv

# Loading values from .env file
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

# Facebook API settings, should remain secret and not be uploaded to public repositories
FB_APP_ID = os.getenv('FB_APP_ID')
FB_APP_SECRET = os.getenv('FB_APP_SECRET')
FB_LOGIN_STATE_PARAM = os.getenv('FB_LOGIN_STATE_PARAM')

# Constants used for building URLs of the Graph API endpoints
GRAPH_API_VERSION = 'v8.0'
HOST_NAME = 'http://localhost:8000/'
FB_LOGIN_REDIRECT_PATH = 'fb_login_redirect'

FB_LOGIN_REDIRECT_URI = f'{HOST_NAME}' + FB_LOGIN_REDIRECT_PATH
FB_AUTH_PARAMS = f'client_id={FB_APP_ID}&redirect_uri={FB_LOGIN_REDIRECT_URI}'
FB_LOGIN_URL = f'https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?{FB_AUTH_PARAMS} \
&state={FB_LOGIN_STATE_PARAM}&scope=groups_show_list'

GRAPH_API_BASE_URL = f'https://graph.facebook.com/{GRAPH_API_VERSION}'
GRAPH_API_ACCESS_TOKEN_PATH = 'oauth/access_token'
FB_APP_ACCESS_TOKEN_URL = f'{GRAPH_API_BASE_URL}/{GRAPH_API_ACCESS_TOKEN_PATH}?client_id={FB_APP_ID} \
&grant_type=client_credentials'
```


## Proceso Manual de Login en Facebook
Actualmente el uso principal del API de Facebook sucede en plataformas cliente como el navegador web o aplicaciones móviles
por ello la documentación contiene poco contenido sobre plataformas de servidor así que prácticamente solo nos queda la opción de realizar manualmente el inicio de sesión, así que eso es lo que haremos.

El flujo de inicio de sesión comienza en nuestra vista home
``` python
@login_required(login_url=settings.FB_LOGIN_URL)  
def home(request):  
```
Debido a que agregamos el decorador `login_required` a nuestra view el usuario no tiene una sesión activa será redirigido a la siguiente URL para que inicie sesión:
``` python
FB_LOGIN_URL = f'https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?{FB_AUTH_PARAMS} \  
&state={FB_LOGIN_STATE_PARAM}&scope=groups_show_list'
```
Los parámetros de esta URL están definidos en el archivo auxiliar `fb_api_requests_urls.py` y las constantes mostradas se cargan de igual manera desde el archivo settings como se describió en la sección de configuración del proyecto.

Después de que el usuario inicia sesión y autoriza nuestra aplicación, se llama a nuestra URL callback, la cual se procesa en esta view: 
``` python
def fb_login_redirect(request):  
    """  
    Process the response from the FB Login, checks the state and error fields, if no errors were
    found, it uses the code from the response to request an auth token. Adds the auth token to
    the session.
    :param request: Django request object  :return: Redirect to Home page to execute token
    validation if success, otherwise Error view (#todo)  
    """
    # Check existing sessions  
    saved_token = request.session.get(fb_api.KEY_FB_AUTH_TOKEN, None)  

    if not fb_api.validate_auth_token(request, saved_token):  
        return HttpResponse("Error validating token")  
  
    # Validate CSRF and check if there was an error  
    state = request.GET['state']  
    
    # TODO Pretty error pages  
    if not state == settings.FB_LOGIN_STATE_PARAM:  
        return 'CSRF Error'
    if 'error' in request.GET:  
        error = request.GET['error']  
        return f'Login Error: {error}'
    
    # Parse auth response  
    auth_code = request.GET['code']  
    auth_token_request = requests.get(fb_api.build_auth_token_url(auth_code))  
    token_response = auth_token_request.json()  
  
    # TODO Validate permissions
    # https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#permscheck

	# Save token in session and redirect to main page
	request.session[fb_api.KEY_FB_AUTH_TOKEN] = token_response['access_token']  
    return redirect('fb:home')
```
Este código es algo extenso, pero básicamente verifica la validez de `auth_token`, si no es válida o si no existe un token guardado anteriormente, se solicita un token nuevo y se redirige al usuario nuevamente al view `home` en donde podrá continuar con el flujo normal para seleccionar el grupo y el tipo de contenido.

## El API de Grupos de Facebook
Una vez en la view `home` se muestra al usuario una lista de los grupos que administra.

![List of FB groups administered by a user](https://i.ibb.co/qjmKHFR/Groups-list-screenshot.png)

Esta vista web es creada por la view `home`, y en el siguiente código vemos que usamos una función auxiliar para obtener los grupos deseados y luego simplemente se muestran usando un template de Django.
``` python
@login_required(login_url=settings.FB_LOGIN_URL)  
def home(request):  
    """  
    Shows a view that allows the user to select the FB group to analyze  
    :param request: Django request object  :return: Home page view or redirects to FB login  
    """
    user_managed_groups = get_managed_groups(request)  
    context = {'groups': user_managed_groups}  
    # TODO Pretty templates
    return render(request, 'fb_data_miner/groups.html', context)
```
Este es el código de la función auxiliar `get_managed_groups`
``` python
def get_managed_groups(request):  
    user_managed_groups = []  
    auth_token = request.session[fb_api.KEY_FB_AUTH_TOKEN]  
  
    user_groups_url = fb_api.build_user_groups_url(request.user.fbprofile.fb_id, auth_token)  
    while True:  
        user_groups_response = requests.get(user_groups_url)  
        user_groups_dict = user_groups_response.json()  
        if not group_request_has_data(user_groups_dict):  
            print('no data')  
            break
        user_groups = user_groups_dict["data"]  
        managed_groups = list(filter(lambda g: g['administrator'], user_groups))  
        user_managed_groups.extend(managed_groups)  
  
        if not group_request_has_next(user_groups_dict):  
            print('no next')  
            break  
  
  user_groups_url = user_groups_dict['paging']['next']  
  
    return user_managed_groups
```
Esta función contiene un ciclo while que llama al API de grupos para obtener todos los grupos del usuarios, los cuales son entregados en distintas páginas. Y debido a que deseamos obtener solo los grupos que el usuario administra, filtramos la respuesta de cada página usando una función lambda que verifica si la propiedad `administrator` de cada grupo tiene un valor de `true`.
También es importante notar que el ciclo while terminará cuando la respuesta de cierta página no contiene una propiedad `next` la cual es la forma de indicar el final de los resultados, según se describe en la [sección de paginación del Graph API](https://developers.facebook.com/docs/graph-api/using-graph-api/#paging).

Cuando seleccionamos la opción `Weekly summary`, el usuario verá una lista de los posts más populares que han sido compartidos durante esta semana, aunque también es posible ajustar el periodo de tiempo usando parámetros de las funciones que obtienen la información del grupo.
``` python
@login_required(login_url=settings.FB_LOGIN_URL)  
def group_weekly_summary(request, group_id, group_name, resp_format='html'):  
    """
    Shows weekly summary of the group, meaning the top posts (also users and topics?) from that
    week, with a default start day of Monday
    :param request: Django request object  :param group_id: id of the group to get the summary
    :param group_name: name of the selected group  :param resp_format: format of the reponse, html or json  :return: View that shows a weekly summary of a group identified by group_id  
    """
    auth_token = request.session[fb_api.KEY_FB_AUTH_TOKEN]  
    group_feed_request_url = fb_api.build_group_feed_url(group_id, auth_token, fb_api.SummaryPeriod.CurrentWeek)  
  
    group_feed = get_all_group_post_from_period(group_feed_request_url)  
    group_feed = list(filter(lambda x: (x.get('shares', {'count': 0})['count'] > 0 or len(x.get('comments', {'data': []})['data']) > 0), group_feed))[:5]
    group_feed.sort(key=lambda x: x.get('shares', {'count': 0})['count'] + len(x.get('comments',{'data': []})['data']), reverse=True)  
    total_comments, top_commented_post, total_shares, top_shared_post = parse_feed_info(group_feed)
```
El proceso para obtener los posts más populares es muy similar a como obtuvimos los grupos que el usuario administra, usamos un ciclo while (dentro de la función auxiliar `get_all_group_post_from_period`) para obtener todas las páginas de resultados de posts y los filtramos los posts de baja interacción usando funciones lambda. Y finalmente ordenamos los posts de mayor a menor interacción para que el usuario vea primer los posts más relevantes.

Continuando con la descripción del view `group_weekly_summary`, dependiendo del valor del parámetro `format` en la URL, la respuesta puede mostrarse como HTML, como lo hemos estado haciendo, o en formato JSON para que pueda ser consumida por nuestro bot de Messenger.
``` python
if resp_format == 'html':  
    context = {  
        'group_name': group_name,
        'group_feed': group_feed,
        'total_comments': total_comments,
        'top_commented_post': top_commented_post,
        'total_shares': total_shares,
        'top_shared_post': top_shared_post,
    }  
    return render(request, 'fb_data_miner/group_weekly_summary.html', context)  
else:  
    for post in group_feed:  
        message = message_element.copy()  
        message['title'] = post['message']  
        message['default_action']['url'] = post['permalink_url']  
        message_gallery['messages'][0]['attachment']['payload']['elements'].append(message)  
    return JsonResponse(message_gallery)
```

## Plantillas de Mensajes de Facebook Messenger
Como se puede ver en el código anterior, para construir una respuesta JSON para nuestro bot, usamos plantillas definidas por el Messenger API.
Estas plantillas las definimos al inicio del archivo como un diccionario de python y en esta función simplemente colocamos en las plantillas la información que obtuvimos del Graph API.

![Messenger template response shown in browser](https://i.ibb.co/d4q3Z6B/Screen-Shot-2020-10-26-at-5-02-41.png)

## Consumiendo nuestro servicio desde un bot de Messenger
Finalmente estamos listos para conectar nuestro servicio con nuestro bot. Para realizar este proceso es necesario usar el Messaging API, el cual puede implementarse en cualquier momento en el que recibas un mensaje de Messenger. Y existen algunas plataformas que ya han realizado esta implementación por nosotros y nos permiten usarla solo configurando algunos parámetros. Nosotros usaremos una de estas plataformas, la cual es Chatfuel.

Dentro de un flow de Chatfuel conectamos un elemento mensaje con una nueva action, la cual crearemos arrastrando el punto de conexión de mensaje hacia un área vacía de la vista del flow de Chatfuel, como se muestra en la siguiente imagen.

![Connecting a message response with a Bot Action in Chatfuel](https://i.ibb.co/cwFWryZ/Screen-Shot-2020-10-26-at-9-58-34.png)

Se creará un nuevo elemento action, presionamos en el botón `+Add action` del nuevo elemento y seleccionamos la opción JSON Request en el menú que aparece.

![Configuring JSON Request action in Chatfuel](https://i.ibb.co/T1jVKDg/Screen-Shot-2020-10-26-at-10-00-27.png)

Cuando seleccionamos esa opción se mostrará una sección para configurar la petición a nuestro servidor como JSON Request, en esta vista, seleccionamos el tipo del request como GET colocamos la url del que corresponde a nuestra vista de `Weekly Summary`, asegurándonos de que el parámetro `format` tenga el valor de `json`

![enter image description here](https://i.ibb.co/HzrF9m9/Screen-Shot-2020-10-26-at-10-02-32.png)

Y eso es todo, ya podemos enviar mensajes desde nuestro bot que dispararán una petición de información al API Graph de Facebook que después podemos procesar y enviar al usuario. ¡Espero que haya sido útil!

## Referencias
[Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
[Facebook Messenger API](https://developers.facebook.com/docs/messenger-platform/)
[Django documentation](https://docs.djangoproject.com/en/3.1/)
[Chatfuel Docs](http://docs.chatfuel.com/en/)