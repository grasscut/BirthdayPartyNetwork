(function(){
	var app = angular.module('birthdayApp', []);
	
	var userId = 1;
	
	app.service('userService', function($http, $q) {
	
		var deferred = $q.defer();
		$http.get('json/userdata.json').then(function(data) {
			deferred.resolve(data);
		});
		
		this.getUsers = function() {
			return deferred.promise;
		};
	})
	
	app.service('partyService', function($http, $q) {
	
		var deferred = $q.defer();
		$http.get('json/partydata.json').then(function(data) {
			deferred.resolve(data);
		});
		
		this.getParties = function() {
			return deferred.promise;
		};
	})
	
	.controller('userCtrl', function($scope, userService, partyService) {
	
		$scope.userId = userId;
		$scope.editBirthday = false;
		$scope.editParty = false;
		
		
		var promiseUsers = userService.getUsers();
		promiseUsers.then(function(data) {
			var jsonLength = data.data.length;
			for (var i = 0; i < jsonLength; i++) {
				var user = data.data[i];
				if ($scope.userId == user.id) {
					$scope.user = user;
					$scope.friends = [];
					for (var j = 0; j < jsonLength; j++) {
						var friend = data.data[j];
						if (friend.friends.indexOf($scope.user.id) > -1) {
							$scope.friends.push(friend);
						}
					}
					break;
				}
			}	
		});
		
		var promiseParties = partyService.getParties();
		promiseParties.then(function(data) {
			var jsonLength = data.data.length;
			$scope.user.parties = [];
			$scope.user.invitations = [];
			for (var i = 0; i < jsonLength; i++) {
				var party = data.data[i];
				if ($scope.userId == party.ownerId) {
					$scope.party = party;
					$scope.party.manager;
					$scope.party.invited = [];
					$scope.party.guests = [];
					for (var j = 0; j < $scope.friends.length; j++) {
						var friend = $scope.friends[j];
						if (friend.id == $scope.party.managerId) {
							$scope.party.manager = friend;
						}
						if ($scope.party.invitedIds.indexOf(friend.id) > -1) {
							$scope.party.invited.push(friend);
						}
						if (party.guestsIds.indexOf(friend.id) > -1) {
							$scope.party.guests.push(friend);
						}
					}
					continue;
				}
				if (party.guestsIds.indexOf($scope.userId) > -1) {
					$scope.user.parties.push(party);
					for (var k = 0; k < $scope.user.friends.length; k++) {
						var friend = $scope.friends[k];
						if (friend.id == party.ownerId) {
							$scope.user.parties[$scope.user.parties.length-1].owner = friend;
						}
					}
				}
				if (party.invitedIds.indexOf($scope.userId) > -1) {
					$scope.user.invitations.push(party);
					for (var l = 0; l < $scope.user.friends.length; l++) {
						var friend = $scope.friends[l];
						if (friend.id == party.ownerId) {
							$scope.user.invitations[$scope.user.invitations.length-1].owner = friend;
						}
					}
				}
			}	
		});
		
		
		this.deleteGift = function(giftIndex) {
			$scope.user.wishlist.splice(giftIndex, 1);
		}
		
		this.deleteParty = function(partyIndex) {
			$scope.user.parties.splice(partyIndex, 1);
		}
		
		this.toggleEditBirthday = function() {
			$scope.editBirthday = !$scope.editBirthday;
		}
		
		this.toggleEditParty = function() {
			$scope.editParty = !$scope.editParty;
		}
		
		this.saveBirthday = function(birthday) {
			$scope.user.birthday = birthday;
		}
		
		this.saveParty = function(newParty) {
			newParty.manager = $.parseJSON(newParty.manager);
			var invitedString = "";
			for (var i = 0; i < newParty.invited.length; i++) {
				invitedString = invitedString + newParty.invited[i] + ",";
			}
			newParty.invited = $.parseJSON('['+invitedString.substring(0, invitedString.length-1)+']');
			$scope.party = newParty;
		}
		
		this.acceptInvitation = function(invitation) {
			invitation.guestsIds.push($scope.userId);
			$scope.user.parties.push(invitation);
			$scope.user.invitations.splice($scope.user.invitations.indexOf(invitation), 1);
		}
		
		this.declineInvitation = function(invitation) {
			invitation.invitedIds.slice(invitation.invitedIds.indexOf($scope.userId), 1);
			$scope.user.invitations.splice($scope.user.invitations.indexOf(invitation), 1);
		}
	})
})();