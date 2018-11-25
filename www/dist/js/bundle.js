angular
.module('lostThings', ['ionic'])
.run(function($ionicPlatform, $rootScope, $state, Utils, Authentication) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.Keyboard) {
      window.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  
  //Permite validar cuando cambia el state si tiene permisos el usuario para acceder a una view especifica
  $rootScope.$on('$stateChangeStart', function(event, toState){
    if (toState.data != undefined && toState.data.requiresAuth) {
      if (!Authentication.isLogged()) {
        event.preventDefault();
        Utils.showPopup('Usuario no autorizado','No se puede acceder a esta sección sin estar autenticado.')
             .then(() => $state.go('login'));
      }
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
      },
      data: {
        requiresAuth: true
      }
    })

    .state('item', {
      url: '/item/:id',
      templateUrl: 'templates/detail.html',
      controller: 'DetailCtrl',
      data: {
        requiresAuth: true
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
angular
.module('lostThings')
.controller('DetailCtrl', [
	'$scope',
	'$stateParams',
	'Utils',
	'Items',
	function($scope, $stateParams, Utils, Items) {
		
		//Request item
		$scope.item = null;

		//Request comentario
		$scope.comment = { description: '', idUser: '' };

		//Obtengo el detalle de la publicación
		Items.getDetail($stateParams.id).then(function(res) {
			$scope.item = res;
		}).catch(_err => Utils.showPopup('Detalle', 'Se produjo un error al obtener la información adicional'));

		/**
		 * Permite comentar una publicacion, realiza las validaciones y 
		 * genera el alta del comentario en la publicacion
		 * @param {Object} formComments
		 * @param {Object} comment
		 * @returns void
		 */
		$scope.addComment = function(formComments, comment) {
			$scope.errors = { description: null };
			if (formComments.description.$invalid) {
				if (formComments.description.$error.required) {
					$scope.errors.description = 'El campo no puede ser vacío';
				}
			} else {
				Items.commentPublication(comment).then(res => {
					$scope.item.comentarios = $scope.item.comentarios.concat(res);
					$scope.comment = '';
					$scope.$apply();
				}).catch(_err => Utils.showPopup('Comentar', 'Se produjo un error al comentar'));
			}
		}

	}
]);
angular.module('lostThings')
.controller('HomeCtrl', [
	'$scope',
	'$state',
	'Items',
	'Utils',
	function($scope, $state, Items, Utils) {
		
		//Flag para mostrar el campo de búsqueda
		$scope.showSearch = false;

		//Al ingresar a la view, actualiza la lista de items
		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.getAllItems();
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
		 * Permite buscar los items, por default se busca '', osea trae todo
		 * @param {string} search
		 * @returns void
		 */
		$scope.searchItems = function(search = '') {
			Items.searchItems(search).then(res => {
				$scope.items = res;
				$scope.$apply();
			}).catch(_err => {
				Utils.showPopup('Home', `Se produjo un error al buscar ${search} en los resultados`);
			});
		}

		/**
		 * Permite actualizar la lista de resultados...
		 * Emite un evento para decirle que termino y que corte el refresh...
		 * @returns void
		 */
		$scope.doRefresh = function() {
			Items.getAllItems().then(res => {
				$scope.items = res;
				$scope.$broadcast('scroll.refreshComplete');
			}).catch(_err => { 
				$scope.$broadcast('scroll.refreshComplete');
				Utils.showPopup('Home', 'Se produjo un error al actualizar los resultados');
			});
		}

		/**
		 * Permite obtener todos los items publicados hasta la fecha,
		 * muestra mensaje de error si ocurre un error...
		 * @returns void
		 */
		$scope.getAllItems = function() {
			Items.getAllItems().then(res => {
				$scope.items = res;
			}).catch(_err => { 
				Utils.showPopup('Home', 'Se produjo un error al obtener los resultados')
			});
		}

		/**
		 * Permite ir al detalle de una publicación
		 * @param {number} id
		 * @returns void
		 */
		$scope.goDetail = function(id) {
			$state.go('item', { id: id });
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
		 * @returns void
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
.controller('LogoutCtrl', [
	'$state',
	'Authentication',
	function($state, Authentication) {
		Authentication.logout();
		$state.go('login');
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
		
		/**
		 * Permite publicar un articulo para que se pueda encontrar
		 * Si sale todo ok, redirige al home...
		 * @param {Object} formPublish
		 * @param {Object} item
		 * @returns void
		 */
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
		 * Permite validar los datos ingresados por el usuario al crear un item para publicar
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
		 * @returns void
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
            token = 'fake-token';
            return new Promise((resolve, reject) => resolve(true));
        }

        function logout() {
            token = null;
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
            logout: logout
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

        /**
         * Permite obtener el detalle de una publicacion
         * @param {number} id
         * @returns Promise
         */
        function getDetail(id) {
            //return $http.get(`${API_SERVER}/items/id=${id}`);
            return new Promise((resolve, reject) => resolve(mockgetDetail));
        }

        /**
         * Permite comentar una publicación
         * @param {Object} item
         */
        function commentPublication(item) {
            //return $http.get(`${API_SERVER}/items/id=${id}`);
            commentPublicationMock.descripcion = item.description;
            return new Promise((resolve, reject) => resolve(commentPublicationMock));
        }

        return {
            getAllItems: getAllItems,
            searchItems: searchItems,
            publishItem: publishItem,
            getDetail: getDetail,
            commentPublication: commentPublication
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