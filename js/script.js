'use strict';

// ?Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// ?Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// print on screen our data-account
const displayMovements = (movements, sort = false) => {
  // clear our old list
  containerMovements.innerHTML = '';

  // for sort our date
  const movSort = sort ? [...movements].sort((a, b) => a - b) : movements;

  // create new list
  movSort.forEach((mov, i) => {
    // check is or not deposit
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov} €</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// balance account
const calcDisplayBalance = account => {
  const balance = account.movements.reduce((acc, sum) => acc + sum, 0);
  account.balance = balance;
  labelBalance.textContent = `${balance} €`;
};

// all the income and spending
const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  // deposit
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int > 1;
    })
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = `${incomes} €`;
  labelSumOut.textContent = `${Math.abs(out)} €`;
  labelSumInterest.textContent = `${interest.toFixed(2)} €`;
};

// add new property <username> for our account. It will be first letter from words
// for exapmle - 'Steven Thomas Williams'; // 'stw'
const createUsernames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(item => item[0])
      .join('');
  });
};
createUsernames(accounts);

// for display user UI
const updateUI = account => {
  // display movements
  displayMovements(account.movements);
  // display balance
  calcDisplayBalance(account);
  // display summary
  calcDisplaySummary(account);
};

// user login
let currentAccount;

btnLogin.addEventListener('click', e => {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    // show UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    //clear fields form
    document.querySelector('.login').reset();
    inputLoginPin.blur();
    // update user UI
    updateUI(currentAccount);
  } else {
    containerApp.style.opacity = 0;
    document.querySelector('.login').reset();
    inputLoginPin.blur();
    labelWelcome.textContent = 'Log in to get started';
    alert('Not the correct user or password');
  }
});

// transfers money between users
btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    amount <= currentAccount.balance &&
    receiverAcc.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    inputTransferAmount.value = inputTransferTo.value = '';

    // update user UI
    updateUI(currentAccount);
  } else {
    alert('There are not enough money in the account!');
  }
});

// request for credit
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = +inputLoanAmount.value;
  const isCanGiveCredit = currentAccount.movements.some(
    mov => mov >= amount * 0.1
  );

  if (amount > 0 && isCanGiveCredit) {
    // add movements
    currentAccount.movements.push(amount);
    // update user UI
    updateUI(currentAccount);
  } else {
    alert(
      'Very large amount. There should be no more than ten percent of the deposit'
    );
  }

  inputLoanAmount.value = '';
});

// close account user
btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // delete from array <accounts>
    accounts.splice(index, 1);
    inputCloseUsername.value = inputClosePin.value = '';

    // hide user UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

// sort transfer of user
let isSorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !isSorted);
  // it helps to switch
  isSorted = !isSorted;
});