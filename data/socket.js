var socketio = require('socket.io'),
  repo = require('./repository'),
  User = require('./User'),
  expire = 7200

module.exports = initSockets;

function initSockets(server, client) {
  var io = socketio.listen(server);

  var users = io.of('/users').on('connection', function(socket) {
    var user;

    function serverError(err, message) {
      console.log(err);
      socket.emit('serverError', {message: message});
    };

    socket.on('add', function(username, area, ack) {
      user = new User(username, area, socket.id);
      repo.setUser(username, area, expire * 2, client)
        .done(function() {
	  socket.join(area);
	  ack();
	}, function(err) {
	  serverError(err, 'error adding new user');
	});
    });

    socket.on('addVotes', function(fs) {
      if(user !== undefined) {
        repo.setVote(user.username, user.area, fs, expire, client)
          .done(function() {
	    io.of('/users').in(user.area).emit('vote', {
	      username: user.username,
	      fs:fs
	    }, function(err) {
	      serverError('User not logged in to add votes');
	    });
	  });
      } else {
        serverError('User is not logged in');
      };
    });

    socket.on('getVotes', function() {
      if(user !== undefined) {
        var area = user.area;
	repo.getVotes(user.area, client).done(function (votes) {
	  votes.forEach(function (vote) {
	    socket.emit('vote', vote);
	  });
	}, function (err) {
	  serverError(err, 'error getting votes')
	});
      } else {
        serverError('User not logging for getting votes')
      }
    });

    socket.on('disconnect', function() {
       if(user !== undefined) {
         socket.leave(user.area);
	 repo.removeUser(user.username, user.area, client).done(null,
	   function(err) {
	     serverError(err, 'error disconnecting')
	   });
       }
       user = null;
    });

  });
};

