const passwordOutput = document.querySelector('#password');
const lengthInput = document.querySelector('#length');
const lengthValue = document.querySelector('#lengthValue');
const generateButton = document.querySelector('#generateButton');
const copyButton = document.querySelector('#copyButton');
const copyText = document.querySelector('#copyText');
const warning = document.querySelector('#warning');
const strengthMeter = document.querySelector('.strength-meter');
const strengthLabel = document.querySelector('#strengthLabel');

const options = {
  lowercase: document.querySelector('#lowercase'),
  uppercase: document.querySelector('#uppercase'),
  numbers: document.querySelector('#numbers'),
  symbols: document.querySelector('#symbols')
};

const characters = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%&*?+-_'
};

function randomIndex(max) {
  // O crypto deixa a escolha mais aleatória que Math.random().
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

function shuffle(text) {
  const letters = [...text];
  for (let i = letters.length - 1; i > 0; i--) {
    const randomPosition = randomIndex(i + 1);
    [letters[i], letters[randomPosition]] = [letters[randomPosition], letters[i]];
  }
  return letters.join('');
}

function updateRange() {
  const min = Number(lengthInput.min);
  const max = Number(lengthInput.max);
  const value = Number(lengthInput.value);
  const percent = ((value - min) / (max - min)) * 100;

  lengthValue.textContent = value;
  lengthInput.style.background = `linear-gradient(to right, #a9ff00 ${percent}%, #3a3f4b ${percent}%)`;
}

function selectedGroups() {
  return Object.keys(options).filter((group) => options[group].checked);
}

function calculateStrength(length, groups) {
  const points = length + groups.length * 3;

  if (points <= 13) return { level: 1, text: 'FRACA' };
  if (points <= 19) return { level: 2, text: 'MÉDIA' };
  if (points <= 26) return { level: 3, text: 'FORTE' };
  return { level: 4, text: 'MUITO FORTE' };
}

function updateStrength() {
  const groups = selectedGroups();
  const strength = calculateStrength(Number(lengthInput.value), groups);

  strengthMeter.className = `strength-meter level-${strength.level}`;
  strengthLabel.textContent = strength.text;
}

function generatePassword() {
  const groups = selectedGroups();
  const length = Number(lengthInput.value);

  if (groups.length === 0) {
    warning.textContent = 'Escolha pelo menos um tipo de caractere.';
    passwordOutput.textContent = 'erro: sem_caracteres';
    strengthMeter.className = 'strength-meter';
    strengthLabel.textContent = 'SEM DADOS';
    return;
  }

  warning.textContent = '';
  let newPassword = '';
  let possibleCharacters = '';

  groups.forEach((group) => {
    possibleCharacters += characters[group];
    // Garante que cada opção marcada apareça pelo menos uma vez.
    newPassword += characters[group][randomIndex(characters[group].length)];
  });

  while (newPassword.length < length) {
    newPassword += possibleCharacters[randomIndex(possibleCharacters.length)];
  }

  passwordOutput.textContent = shuffle(newPassword);
  updateStrength();
}

async function copyPassword() {
  const password = passwordOutput.textContent;

  if (password.startsWith('erro:')) return;

  try {
    await navigator.clipboard.writeText(password);
    copyText.textContent = 'COPIADO';
    copyButton.classList.add('copied');
  } catch {
    // Alternativa para navegadores que não liberam a Clipboard API.
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = password;
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    document.execCommand('copy');
    temporaryInput.remove();
    copyText.textContent = 'COPIADO';
    copyButton.classList.add('copied');
  }

  window.setTimeout(() => {
    copyText.textContent = 'COPIAR';
    copyButton.classList.remove('copied');
  }, 1600);
}

lengthInput.addEventListener('input', () => {
  updateRange();
  updateStrength();
});

generateButton.addEventListener('click', generatePassword);
copyButton.addEventListener('click', copyPassword);
Object.values(options).forEach((option) => option.addEventListener('change', generatePassword));

updateRange();
generatePassword();
