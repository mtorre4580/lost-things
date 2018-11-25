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