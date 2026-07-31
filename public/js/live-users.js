const socket = io();
let joinedAsUser = false;

function renderLiveUsers(users) {
  $('#liveCount').text(users.length);
  if (!users.length) {
    $('#liveUsers').html('<div class="empty">No inserted users are connected to the room.</div>');
    return;
  }

  $('#liveUsers').html(users.map((user) => `
    <button class="live-user" type="button" data-user-id="${escapeHtml(user.userId)}">
      <strong>${escapeHtml(user.email)}</strong>
      <span>${escapeHtml(user.name)}</span>
      <span>Socket ID: ${escapeHtml(user.socketId)}</span>
    </button>
  `).join(''));
}

function watchRoom() {
  socket.emit('watch-live-users', (response) => {
    if (response?.success) {
      renderLiveUsers(response.users || []);
      if (!sessionStorage.getItem('lastCreatedUserId')) {
        $('#connectionStatus')
          .removeClass('info error')
          .addClass('success')
          .text(`Connected as an observer. Socket ID: ${socket.id}`)
          .show();
      }
    }
  });
}

function joinRecentUser() {
  const userId = sessionStorage.getItem('lastCreatedUserId');
  if (!userId || joinedAsUser) return;

  socket.emit('join-live-users', { userId }, (response) => {
    if (response?.success) {
      joinedAsUser = true;
      renderLiveUsers(response.users || []);
      $('#connectionStatus')
        .removeClass('info error')
        .addClass('success')
        .html(`Recent user connected to <strong>live_users</strong>. Socket ID: ${escapeHtml(socket.id)}`)
        .show();
    } else {
      $('#connectionStatus')
        .removeClass('info success')
        .addClass('error')
        .text(response?.message || 'Could not join as the recently created user.')
        .show();
    }
  });
}

socket.on('connect', () => {
  watchRoom();
  joinRecentUser();
});

socket.on('live-users-updated', renderLiveUsers);

socket.on('disconnect', () => {
  joinedAsUser = false;
  $('#connectionStatus')
    .removeClass('success error')
    .addClass('info')
    .text('Socket disconnected. Reconnecting…')
    .show();
});

$('#liveUsers').on('click', '.live-user', function () {
  fetchAndOpenUser($(this).data('user-id'));
});
