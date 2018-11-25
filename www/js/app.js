angular
.module('lostThings', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.Keyboard) {
      window.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  /*
    Rutas de la aplicacion, hay 2 views las cuales no
    dependen de tab, ya que se necesita que no dependendan del tab
    estas son Login y Register, una vez que ingresan a la aplicacion
    el dashboard es el main view (tabs)
  */
  $stateProvider
    
    .state('dashboard', {
      url: '/dashboard',
      abstract: true,
      templateUrl: 'templates/dashboard.html'
    })
    .state('dashboard.home', {
      url: '/home',
      views: {
        'tab-home': {
          templateUrl: 'templates/dashboard-home.html',
          controller: 'HomeCtrl'
        }
      }
    })
    .state('dashboard.publish', {
      url: '/publish',
      views: {
        'tab-publish': {
          templateUrl: 'templates/dashboard-publish.html',
          controller: 'PublishCtrl'
        }
      }
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    })
    .state('logout', {
      url: '/logout',
      controller: 'LogoutCtrl'
    })

    //Por default se muestra la view de login...
    $urlRouterProvider.otherwise('/login');

    //Se configura el texto del button back a mostrar...
    $ionicConfigProvider.backButton.text('Atrás');

}).constant('API_SERVER', 'http://localhost/lostthings/api');