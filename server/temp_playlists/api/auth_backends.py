from rest_framework_social_oauth2.backends import DjangoOAuth2

class DjangoOAuth2Wrapper(DjangoOAuth2):

    def get_user_details(self, response):
        return {}
