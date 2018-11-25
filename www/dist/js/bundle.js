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

  // //Por default se muestra la view de login...
    $urlRouterProvider.otherwise('/login');

  //Se configura el texto del button back a mostrar...
  $ionicConfigProvider.backButton.text('Atrás');

}).constant('API_SERVER', 'http://localhost/lostthings/api');
angular.module('lostThings')
.controller('HomeCtrl', [
	'$scope',
	'Items',
	'Utils',
	function($scope, Items, Utils) {

		$scope.showSearch = false;

		Items.getAllItems().then(res => {
			$scope.items = res;
		}).catch(_err => { 
			Utils.showPopup('Home', 'Se produjo un error al obtener los resultados')
		});

		/**
		 * Permite mostrar y esconder el formulario
		 * de busqueda para realizar una busqueda de items
		 * @returns void
		 */
		$scope.toggleSearch = function() {
			$scope.showSearch = !$scope.showSearch;
		}

		/**
		 * Permite buscar los items, por default se busca '',
		 * osea trae todo
		 * @param {string} search
		 */
		$scope.searchItems = function(search = '') {
			Items.searchItems(search).then(res => {
				$scope.items = res;
				$scope.$apply();
			}).catch(_err => {
				Utils.showPopup('Home', `Se produjo un error al buscar ${search} en los resultados`);
			});
		}

		$scope.doRefresh = function() {
			Items.getAllItems().then(res => {
				$scope.items = res;
				$scope.$broadcast('scroll.refreshComplete');
			}).catch(_err => { 
				$scope.$broadcast('scroll.refreshComplete');
				Utils.showPopup('Home', 'Se produjo un error al actualizar los resultados');
			});
		}

	}
]);
angular
.module('lostThings')
.controller('LoginCtrl', [
	'$scope',
	'$state',
	'Authentication',
	'Utils',
	function($scope, $state, Authentication, Utils) {

		//Request Login
		$scope.user = { email: '', password: '' };

		/**
		 * Permite autenticar al usuario
		 * Valida los datos recibidos, si sale todo OK si sale bien , redirige...
		 * @param formLogin 
		 * @param user 
		 */
		$scope.login = function(formLogin, user) {
			$scope.errors = validateFields(formLogin);
			if ($scope.errors.email === null && $scope.errors.password === null) {
				Authentication.login(user).then(res =>  {
					Utils.showPopup('Autenticación', 'Se ha autenticado correctamente!')
						 .then(() => $state.go('dashboard.home'));
				}).catch(_error => Utils.showPopup('Autenticación', '¡Ups se produjo un error al autenticarse'));
			}
		}

		/**
		 * Permite validar los datos ingresados por el usuario
		 * @param {Object} formLogin 
		 * @return errors
		 */
		function validateFields(formLogin) {
			let errors = { email: null, password: null };
			if (formLogin.email.$invalid) {
				if (formLogin.email.$error.required) {
					errors.email = 'El campo email no puede ser vacío';
				}
				if (formLogin.email.$error.email) {
					errors.email = 'No es un email válido';
				}
			}
			if (formLogin.password.$invalid) {
				if (formLogin.password.$error.required) {
					errors.password = 'El campo password no puede ser vacío';
				}
			}
			return errors;
		}

	}
]);
angular
.module('lostThings')
.controller('PublishCtrl', [
	'$scope',
	'$state',
	'Utils',
	'Items',
	function($scope, $state, Utils, Items) {
			
		//Request Publish
		$scope.item = { name: '', description: '', pic: null };
		
		$scope.publish = function(formPublish, item) {
			$scope.errors = validateFields(formPublish);
			if ($scope.errors.name === null && $scope.errors.description === null) {
				Items.publishItem(item).then(() =>  {
					Utils.showPopup('Publicar', '<p>Se ha subido su publicación <br /> ¡Buena suerte!</p>')
							.then(() => $state.go('dashboard.home'));
				}).catch(_error => Utils.showPopup('Publicar', '¡Ups se produjo un error al querer publicar su artículo'));
			}
		}

		/**
		 * Permite validar los datos ingresados por el usuario
		 * al crear un item para publicar
		 * @param {Object} formPublish 
		 * @return errors
		 */
		function validateFields(formPublish) {
			let errors = { name: null, description: null };
			if (formPublish.name.$invalid) {
				if (formPublish.name.$error.required) {
					errors.name = 'El campo nombre no puede ser vacío';
				}
			}
			if (formPublish.description.$invalid) {
				if (formPublish.description.$error.required) {
					errors.description = 'El campo descripción no puede ser vacío';
				}
			}
			return errors;
		}

	}
]);
angular
.module('lostThings')
.controller('RegisterCtrl', [
	'$scope',
	'$state',
	'Authentication',
	'Utils',
	function($scope, $state, Authentication, Utils) {

		//Request Registro
		$scope.user = { email: '', password: '', pic: '' };

		/**
		 * Permite registrar al usuario valida los datos recibidos, si sale todo OK
		 * realiza un redirect al login
		 * @param formRegister 
		 * @param user 
		 */
		$scope.register = function(formRegister, user) {
			$scope.errors = validateFields(formRegister);
			if ($scope.errors.email === null && $scope.errors.password === null) {
				Authentication.register(user).then(res =>  {
					Utils.showPopup('Registrarse', 'Se ha creado su cuenta!').then(() => $state.go('login'));
				}).catch(_error => {
					Utils.showPopup('Registrarse', '¡Ups se produjo un error al registrar al usuario');
				});
			}
		}

		/**
		 * Permite validar los datos ingresados por el usuario
		 * @param {Object} formRegister 
		 * @return errors
		 */
		function validateFields(formRegister) {
			let errors = { email: null, password: null, pic: '' };
			if (formRegister.email.$invalid) {
				if (formRegister.email.$error.required) {
					errors.email = 'El campo email no puede ser vacío';
				}
				if (formRegister.email.$error.email) {
					errors.email = 'No es un email válido';
				}
			}
			if (formRegister.password.$invalid) {
				if (formRegister.password.$error.required) {
					errors.password = 'El campo password no puede ser vacío';
				}
			}
			return errors;
		}

	}
]);
angular
.module('lostThings')
.factory('Authentication', 
    ['$http', 'API_SERVER', 
    function($http, API_SERVER){
        
        let token = null;

        /**
         * Permite autenticar al usuario contra la API de PHP
         * @param {Object} user 
         * @return boolean
         */
        function login(user) {
            // return $http.post(`${API_SERVER}/login`, user).then(function(res) {
            //     let response = res.data;
            //     if (response.status == 1) {
            //         return true;
            //     }
            //     return false;
            // });
            //MOCK
            return new Promise((resolve, reject) => resolve(true));
        }

        /**
         * Permite registrar al usuario utilizando la API de PHP
         * @param {Object} user 
         * @returns Object
         */
        function register(user) {
            // return $http.post(`${API_SERVER}/register`, user).then(function(res) {
            //     let response = res.data;
            //     if (response.status == 1) {
            //         //token = response.data.token;
            //         // userData = {
            //         //     id		: response.data.id,
            //         //     usuario : response.data.usuario
            //         // };
            //         return true;
            //     }
            //     return false;
            // });

            //MOCK
            return new Promise((resolve,reject) => resolve());
        }

        /**
         * Permite saber si el usuario esta logueado, valida si existe el token
         * @return boolean
         */
        function isLogged() {
            return token !== null;
        }

        /**
         * Permite obtener el token JWT
         * @return token
         */
        function getToken() {
            return token;
        }

        return {
            login: login,
            register: register,
            isLogged: isLogged,
            getToken: getToken,
        }

    }
]);
angular
.module('lostThings')
.factory('Items', 
    ['$http', 'API_SERVER', 
    function($http, API_SERVER){
        
        /**
         * Permite obtener todos los items perdidos
         * @returns Promise
         */
        function getAllItems() {
            /*return $http.get(`${API_SERVER}/items`).then(function(res) {
                
            });*/
            //Mock
            return new Promise((resolve, reject) => resolve(getAllMock));
        }

        /**
         * Permite buscar los items por el valor ingresado como parametro
         * @param {string} search 
         * returns Promise
         */
        function searchItems(search) {
            // return $http.get(`${API_SERVER}/items?search=${search}`).then(function(res) {
                
            // });
            //Mock
            return new Promise((resolve, reject) => resolve(searchItemsMock));
        }

        /**
         * Permite publicar un item para mostrarse en el listado
         * @param {Object} item 
         */
        function publishItem(item) {
            /*return $http.post(`${API_SERVER}/items`).then(function(res) {
                
            });*/
            //Mock
            return new Promise((resolve, reject) => resolve(publishItemMock));
        }

        return {
            getAllItems: getAllItems,
            searchItems: searchItems,
            publishItem: publishItem
        }

    }
]);

angular
.module('lostThings')
.factory('Utils', 
    ['$ionicPopup', 
    function($ionicPopup){
        
        /**
		 * Permite crear una instancia del popup de ionic
		 * @param {string} title titulo del popup
		 * @param {string} text texto del popup, puede ser HTML
		 * @returns Promise
		 */
		function showPopup(title, text) {
			return $ionicPopup.alert({ title: title, template: text, cssClass:'lost-things-popup', okText: 'Aceptar' });
		}

        return {
            showPopup: showPopup
        }

    }
]);