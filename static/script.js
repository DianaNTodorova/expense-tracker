const categoryImages = {
  food: '/static/images/food_icon.png',
  entertainment: '/static/images/party_icon.png',
  travel: '/static/images/transport_icon.png',
  rent: '/static/images/home_icon.png',
  other: '/static/images/other_icon.png',
};

document.addEventListener('DOMContentLoaded', function () {
  console.log('JavaScript loaded successfully!');

  let totalExpensesValue = 0;
  let balanceValue = 0;

  flatpickr('#date', {
    enableTime: false,
    dateFormat: 'Y-m-d',
    defaultDate: new Date(),
  });

  function setIncome(event) {
    event.preventDefault();
    let incomeInput = document.getElementById('income');
    let balanceElement = document.getElementById('balance');

    let incomeValue = parseFloat(incomeInput.value);
    if (isNaN(incomeValue) || incomeValue <= 0) {
      alert('Please enter a valid income!');
      return;
    }

    balanceValue = incomeValue;
    balanceElement.innerText = `$${balanceValue}`;
    incomeInput.value = '';
  }

  function setExpense(event) {
    event.preventDefault();

    let expenseInput = document.getElementById('amount');
    let totalExpenseElement = document.getElementById('totalExpenses');
    let balanceElement = document.getElementById('balance');
    let expenseList = document.getElementById('expenseList');
    let categoryInput = document.getElementById('category');
    let dateInput = document.getElementById('date');

    let expenseAmount = parseFloat(expenseInput.value);
    let category = categoryInput.value.trim().toLowerCase();
    let date = dateInput.value;

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      alert('Please enter a valid expense!');
      return;
    }

    totalExpensesValue += expenseAmount;
    totalExpenseElement.innerText = `$${totalExpensesValue}`;

    balanceValue -= expenseAmount;
    balanceElement.innerText = `$${balanceValue}`;

    expenseInput.value = '';

    const categoryClass = category || 'other';
    const categoryImage = categoryImages[category] || categoryImages['other'];

    let newExpense = document.createElement('div');
    newExpense.innerHTML = `
      <div class="card h-100 ${categoryClass}">
        <div class="card-body text-center p-0">
          <img src="${categoryImage}" class="card-img-top align-items-center" alt="${category}" style="width: 34px; margin-bottom: 10px;">
          <button class="btn btn-danger btn-sm remove-expense">x</button>
          <h5 class="card-title">${
            category.charAt(0).toUpperCase() + category.slice(1)
          }</h5>
          <p class="card-text">$${expenseAmount}</p>
          <small style="display: none">${date}</small>
        </div>
      </div>
    `;

    expenseList.appendChild(newExpense);

    newExpense
      .querySelector('.remove-expense')
      .addEventListener('click', function () {
        totalExpensesValue -= expenseAmount;
        balanceValue += expenseAmount;

        totalExpenseElement.innerText = `$${totalExpensesValue}`;
        balanceElement.innerText = `$${balanceValue}`;

        newExpense.remove();
        updateDownloadButton(); // Update button when expense is removed
      });

    updateDownloadButton(); // Call the function to update the button
  }

  function updateDownloadButton() {
    let expenseList = document.getElementById('expenseList');
    let downloadButton = document.getElementById('downloadAllExpenses');
    let buttonContainer = document.getElementById('buttonContainer');

    if (downloadButton) {
      downloadButton.remove(); // Remove existing button to avoid duplicates
    }

    if (expenseList.children.length > 0) {
      downloadButton = document.createElement('button');
      downloadButton.innerText = 'Download Expenses';
      downloadButton.classList.add('btn', 'btn-expense', 'mt-3');
      downloadButton.id = 'downloadAllExpenses';

      // Attach click event to download button
      downloadButton.addEventListener('click', sendExpensesToServer);

      buttonContainer.appendChild(downloadButton);
    }
  }

  function sendExpensesToServer() {
    let expenses = collectExpenses();

    fetch('/download-expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expenses: expenses }),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error('Download failed!');
      })
      .then((blob) => {
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'All_Expenses.txt';
        link.click();
      })
      .catch((error) => console.error('Error downloading file:', error));
  }

  function collectExpenses() {
    let expenseList = document.getElementById('expenseList').children;
    let expenses = [];

    for (let expense of expenseList) {
      let category = expense.querySelector('.card-title').innerText;
      let amount = expense
        .querySelector('.card-text')
        .innerText.replace('$', '')
        .trim();
      let date = expense.querySelector('small').innerText;

      expenses.push({
        category: category,
        amount: parseFloat(amount),
        date: date,
      });
    }

    return expenses;
  }

  document.querySelector('.btn-income').addEventListener('click', setIncome);
  document.querySelector('.btn-expense').addEventListener('click', setExpense);
});
