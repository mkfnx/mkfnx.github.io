---
layout: post
title: Using data from the Facebook API in your Messenger bot
---

This tutorial shows how to create a Django service that fetch data from the Facebook Graph API to be consumed by a Messenger Bot.
Demo code can be obtained in GitHub and the sample project can be tested in this bot.

## Project Description
The project that we review in this tutorial is a Messenger bot that helps members of our Developer Circles Facebook group to discover relevant content. We retrieve the data of the Facebook group using the Graph API, analyze it and present it to the users via the bot so they can have easy access to the most relevant content of the group.

![Group API response received in Messenger](https://i.ibb.co/dLDDhmB/Screen-Shot-2020-10-26-at-4-56-22.png)

The following diagram shows a basic view of the components of the project. We'll focus on the right side of the image, in particular in the`Content Parser Service` which is the one that provides the info to the Messenger bot. This service communicate with the server that hosts the bot, it can be the same or a different one, wee see that it retrieves the info from a Facebook Group.

![Bot server diagram](https://i.ibb.co/4PD19DX/Graph-Api-Bot-Diagram.png)

## Pre-requisites
* Python and pipenv installed.
* Familiarity with python requests lib.
* Know how to create new Django projects and familiarity with Django's views, responses and templates.
* Know how to setup a Messenger bot in any platform that allows consuming an external web service or API. We'll use Chatfuel for the demo on this tutorial.

## Setting Up a Virtual Environment Using pipenv
First, we create a new folder for our project and move into it
``` bash
mkdir fb_groups_api_for_messenger && cd fb_groups_api_for_messenger
```
Next we'll use pipenv for installing Django
``` bash
pipenv install django
```
And now we activate our virtual environment with:
``` bash
pipenv shell
```
Now we create a new Django project
``` bash
django-admin startproject fb_groups_api_for_messenger
```
And finally we create and app inside our project
``` bash
python manage.py startapp fb_group_data
```

## Setting Up the Django Project
Now that we have our Django project we'll add a few urls, one needed for completing the Facebook authentication process and the others for building a flow for fetching the group's info. This urls need to be added to the `fb_group_data` urls file.
``` python
path('fb_login_redirect', views.fb_login_redirect, name='fb_login_redirect'),  
path('', views.home, name='home'),  
path('group/<int:group_id>', views.group, name='group'),  
path('group/<int:group_id>/weekly_summary?group_name=<str:group_name>'  
 '&format=<str:resp_format>', views.group_weekly_summary,  
  name='group_weekly_summary'),
```
We found the following params defined in our urls:
* `group_id`: To know from which group we'll fetch info from.
* `group_name`: Used as a label in a HTML view.
* `resp_format`: To indicate the desired response format.

And now we include this app file into the `urlpatterns`  list of the main urls file
``` python
urlpatterns = [  
    path('', include('fb_group_data.urls', namespace='fb')),
```

Now we add the corresponding views for this urls, we'll describe the views in detail in the following sections.
``` python
def fb_login_redirect(request):

@login_required(login_url=settings.FB_LOGIN_URL)  
def home(request):

@login_required(login_url=settings.FB_LOGIN_URL)  
def group(request, group_id):

@login_required(login_url=settings.FB_LOGIN_URL)  
def group_weekly_summary(request, group_id, group_name, resp_format='html'):
```

Also, don't forget to run the Django migrations so you can runt and test the project
```
python manage.py migrate
```

### Settings and .env
The values referenced from `settings` are defined in the Django settings file and some of them are imported using the `dotenv` library, so we can keep this information stored only in our server and restricted to public access and avoid accidentally sending to public when uploading our code to services like GitHub.
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


## Facebook Manual Login Flow
The main usage of the Facebook API now occurs in client platforms such as the web browser and mobile apps, that's why the documentation now shows little info for server platforms and if we are interested on this we are practically left with the options of building a manual login flow, so we'll do that.

Our app's flow starts int the home view
``` python
@login_required(login_url=settings.FB_LOGIN_URL)  
def home(request):  
```
Given that we added the `login_required` decorator to our view if the user is not logged in it will be send to the Facebook Login using a URL that we build like this:
``` python
FB_LOGIN_URL = f'https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?{FB_AUTH_PARAMS} \  
&state={FB_LOGIN_STATE_PARAM}&scope=groups_show_list'
```
The params of this URL are defined in the aux file `fb_api_requests_urls.py` this constants are loaded using settings and env library as described in the Setup section.

After the user authorizes our app, the callback url that we configured in Facebook and that we setup before in the urls file will be called.
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
This code is more extensive, but basically it checks the validity of an `auth_token` if it's not valid anymore or if we don't have a previously saved one, it will request a new one, save it for future usage and sen users again to the `home` view so they can continue with the normal data flow.

## The Facebook Groups API
After a successful authentication users land in the `home` view that shows the list of the groups that they manage.

![List of FB groups administered by a user](https://i.ibb.co/qjmKHFR/Groups-list-screenshot.png)

This web page is rendered by the home view that we previously listed, the complete code shows that it uses a helper function to get the groups managed to the user and it renders them to the web browser using a template.
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
This is the code of the `get_managed_groups` helper function
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
The helper function contains a while loop that calls the groups API for fetching all the groups that the users are members, however it will filter only the groups that the users manage, the filter is done using a lambda function that check if the `administrator` field of each group item has the value of `true`. Also note that the while loops ends when the response doesn't contain a field called `next` which happens in the final page of the response as described in the [pagination documentation](https://developers.facebook.com/docs/graph-api/using-graph-api/#paging).

Then when selecting a group, users see a summary of the group and a menu of possible data points to analyze such as members, topics or posts summary.

![Summary and options for a particular Facebook Group](https://i.ibb.co/564FtsJ/Screen-Shot-2020-10-26-at-9-52-40.png)

When selecting the `Weekly summary` option, the users get a list of the most popular posts shared during this week, or some other time period, depending of the value of a function param.
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
The process for getting the most popular post of a period of time is pretty similar to how we got the groups that a user manage, we use a while loop (inside the helper function `get_all_group_post_from_period`) for fetching all the pages that contains posts for a period of time and then we filter the posts that have low interaction and sort them from more interaction to less interaction, so users see the most popular posts at the beginning.

Continuing with the description of the `gropu_weekly_summary` view, depending on the value of the `format` URL param, the response can be fetched as an HTML view, as we have been doing, or more important for our purpose, in JSON format so it can be consumed by our Messenger bot.
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

## Facebook Messenger Response and Templates
As we saw in the previous snippet, for building the JSON response for our Messenger bot, we used some of the message templates that are defined by the Messenger API. This templates are defined as a dict almost at the beginning of the file and then are just populated with the data retrieved by the querys made to the Graph API.

![Messenger template response shown in browser](https://i.ibb.co/d4q3Z6B/Screen-Shot-2020-10-26-at-5-02-41.png)

## Consuming our service from a Messenger Bot
Finally we are ready to hook our service that fetches info from the Facebook Graph API with our Messenger bot, this process make use of the Messaging APIs, it can be implemented at any point you receive a message and some platforms that help us to create bots provide very simple ways to connect our bots, we'll use Chatfuel in this tutorial to illustrate this.

First, inside a Chatfuel flow we connect a message element with a new action element that we can create by dragging from the connection point of the message to an empty space in the flow view, as shown in the following picture.

![Connecting a message response with a Bot Action in Chatfuel](https://i.ibb.co/cwFWryZ/Screen-Shot-2020-10-26-at-9-58-34.png)

A new action item will be create, we click on the `+Add action` button that shows and we select JSON Request in the menu that appears

![Configuring JSON Request action in Chatfuel](https://i.ibb.co/T1jVKDg/Screen-Shot-2020-10-26-at-10-00-27.png)

And when selecting that option a section for configuring our JSON Request will appear, in this view we select a request type of GET and we use our url from the last step, making sure of specifying the `format` param as `json`

![enter image description here](https://i.ibb.co/HzrF9m9/Screen-Shot-2020-10-26-at-10-02-32.png)

And that will be all, with that you can start sending messages to your bot that will trigger a process for fetching and processing data from the Facebook Graph API. Hope you find it useful!

## References
[Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
[Facebook Messenger API](https://developers.facebook.com/docs/messenger-platform/)
[Django documentation](https://docs.djangoproject.com/en/3.1/)
[Chatfuel Docs](http://docs.chatfuel.com/en/)