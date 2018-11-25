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