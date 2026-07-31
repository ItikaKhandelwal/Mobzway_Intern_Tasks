function escapeHtml(value) {
  return $('<div>').text(value == null ? '' : String(value)).html();
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function openUserModal(user) {
  const address = user.address || {};
  const fullAddress = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(', ');

  $('#modalBody').html(`
    <dl class="details">
      <div class="detail"><dt>First name</dt><dd>${escapeHtml(user.firstName)}</dd></div>
      <div class="detail"><dt>Last name</dt><dd>${escapeHtml(user.lastName)}</dd></div>
      <div class="detail"><dt>Email</dt><dd>${escapeHtml(user.email)}</dd></div>
      <div class="detail"><dt>Mobile</dt><dd>${escapeHtml(user.mobile)}</dd></div>
      <div class="detail"><dt>Login ID</dt><dd>${escapeHtml(user.loginId)}</dd></div>
      <div class="detail"><dt>MongoDB ID</dt><dd>${escapeHtml(user._id)}</dd></div>
      <div class="detail full"><dt>Address</dt><dd>${escapeHtml(fullAddress)}</dd></div>
      <div class="detail"><dt>Creation time</dt><dd>${escapeHtml(formatDate(user.createdAt))}</dd></div>
      <div class="detail"><dt>Last updated on</dt><dd>${escapeHtml(formatDate(user.updatedAt))}</dd></div>
    </dl>
  `);
  $('#userModal').addClass('open').attr('aria-hidden', 'false');
}

function fetchAndOpenUser(userId) {
  $.ajax({
    url: `/api/users/${encodeURIComponent(userId)}`,
    method: 'GET',
    dataType: 'json'
  })
    .done((response) => openUserModal(response.data))
    .fail((xhr) => alert(xhr.responseJSON?.message || 'Unable to load user details.'));
}

$(document).on('click', '.close-modal, .modal-backdrop', function (event) {
  if ($(event.target).is('.modal-backdrop, .close-modal')) {
    $('#userModal').removeClass('open').attr('aria-hidden', 'true');
  }
});

$(document).on('keydown', function (event) {
  if (event.key === 'Escape') {
    $('#userModal').removeClass('open').attr('aria-hidden', 'true');
  }
});
