var form = document.querySelector('form');
var hashInput = document.querySelector('.input-hash');
var commandInput = document.querySelector('.input-command');

if (form && hashInput && commandInput) {
    submitForm();
}

        function submitForm() {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                var hash = hashInput.value;
                var command = commandInput.value;

                console.log('submit');

                const response = await fetch('/build_request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ hash, command }),
                });
                const body = await response.text();
                makeAnAction(JSON.parse(body));
            })
        }

        function makeAnAction(data) {
            console.log('[makeAnAction]');

            if (data.buildReview) {
                insertBuildReview(data);
            }
            else if (data.agentFilled) {
                notifyAboutBusyAgents();
            }
        }

        function insertBuildReview(data) {
            console.log('[insertBuildReview]');

            var hash = data.buildReview.buildCode;
            var code = (data.buildReview.code === 0) ? 'Успешно' : 'Ошибка';
            var time = data.buildReview.time;
            var colorModificator = (data.buildReview.code === 0) 
                ? 'list__status_success' 
                : 'list__status_failure';

            var content = document.querySelector('.list__content');
            const markup = `
            <div class='list__item'>
                <div class='list__ref'>
                    <a href='/build/${hash}' target='_blank'>${hash}</a>
                </div>
                <div class='list__status ${colorModificator}'>${code}</div>
                <div class='list__time'>${time}</div>
            </div>`;
            content.insertAdjacentHTML('beforeend', markup);
        }

        function notifyAboutBusyAgents() {
            console.log('[notifyAboutBusyAgents]');
            console.log('ALL AGENTS ARE BUSY RIGHT NOW');

            const messageNode = document.querySelector('.list__message_busy');
            if (messageNode.classList.contains('list__message_busy_hidden')) {
                messageNode.classList.remove('list__message_busy_hidden');
                setTimeout(function() {
                    messageNode.classList.add('list__message_busy_hidden');
                }, 1800);
            }
        }