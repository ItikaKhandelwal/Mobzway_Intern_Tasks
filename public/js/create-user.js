const socket = io();

function renderLiveUsers(users) {
  $('#liveCount').text(users.length);
  if (!users.length) {
    $('#liveUsers').html('<div class="empty">No inserted users are connected right now.</div>');
    return;
  }

  $('#liveUsers').html(users.map((user) => `
    <button class="live-user" type="button" data-user-id="${escapeHtml(user.userId)}">
      <strong>${escapeHtml(user.email)}</strong>
      <span>${escapeHtml(user.name)}</span>
      <span>Socket: ${escapeHtml(user.socketId)}</span>
    </button>
  `).join(''));
}

socket.emit('watch-live-users', (response) => {
  if (response?.success) renderLiveUsers(response.users || []);
});

socket.on('live-users-updated', renderLiveUsers);

$('#userForm').on('submit', function (event) {
  event.preventDefault();
  const $button = $('#saveButton');
  const $status = $('#formStatus');

  const payload = {
    firstName: $('#firstName').val(),
    lastName: $('#lastName').val(),
    mobile: $('#mobile').val(),
    email: $('#email').val(),
    address: {
      street: $('#street').val(),
      city: $('#city').val(),
      state: $('#state').val(),
      country: $('#country').val()
    },
    loginId: $('#loginId').val(),
    password: $('#password').val()
  };

  $button.prop('disabled', true).text('Saving…');
  $status.removeClass('success error info').hide();

  $.ajax({
    url: '/api/users',
    method: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify(payload)
  })
    .done((response) => {
      const user = response.data;
      sessionStorage.setItem('lastCreatedUserId', user._id);
      $status
        .addClass('success')
        .html(`User saved in MongoDB. Joining <strong>live_users</strong> room…`)
        .show();

      socket.emit('join-live-users', { userId: user._id }, (joinResponse) => {
        if (joinResponse?.success) {
          renderLiveUsers(joinResponse.users || []);
          $status
            .addClass('success')
            .html(`User saved and connected to <strong>live_users</strong>. Socket ID: ${escapeHtml(socket.id)}`)
            .show();
        } else {
          $status
            .removeClass('success')
            .addClass('error')
            .text(joinResponse?.message || 'User saved, but Socket.IO room join failed.')
            .show();
        }
      });

      this.reset();
    })
    .fail((xhr) => {
      const response = xhr.responseJSON || {};
      const messages = response.errors?.length
        ? response.errors.map(escapeHtml).join('<br>')
        : escapeHtml(response.message || 'Unable to save user.');
      $status.addClass('error').html(messages).show();
    })
    .always(() => {
      $button.prop('disabled', false).text('Save User');
    });
});

$('#liveUsers').on('click', '.live-user', function () {
  fetchAndOpenUser($(this).data('user-id'));
});
