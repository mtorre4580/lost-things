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