const toFormattedCurrency = function (price) {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'usd',
        style: 'currency'
    }).format(price)
};

const toDate = function (date) {
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date))
};

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toFormattedCurrency(node.textContent)
});

document.querySelectorAll('.date').forEach(node => {
    node.textContent = toDate(node.textContent)
});

const $card = document.querySelector('#card');
if ($card) {
    $card.addEventListener('click', event => {
        if (event.target.classList.contains('js-remove')) {
            const id = event.target.dataset.id;

            fetch('/card/remove/' + id, {
                method: 'delete'
            })
                .then(res => res.json())
                .then(card => {
                    if (card.courses.length != 0) {
                        const html = card.courses.map(course => {
                            return `
                            <tr>
                    <td>${course.title}</td>
                    <td>${course.count}</td>
                    <td>
                        <button class="btn btn-small js-remove" data-id="${course.id}">Delete</button>
                    </td>
                </tr>`
                        }).join();

                        $card.querySelector('tbody').innerHTML = html;
                        $card.querySelector('.price').textContent = toFormattedCurrency(card.price);
                    } else {
                        $card.innerHTML = '<p>Card is empty</p>'
                    }
                })
        }
    });
}

M.Tabs.init(document.querySelectorAll('.tabs'));