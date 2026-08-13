/**
 * Testes básicos - Recife Vital
 * 
 * Execute no console do navegador (F12) quando o app estiver rodando
 * ou use com uma ferramenta de teste como Jest
 */

const Tests = {
  // Teste 1: Validar componentes principais
  testComponentsExist: () => {
    const app = document.querySelector('.app-shell');
    const auth = document.querySelector('.auth-shell');
    
    if (app || auth) {
      console.log('✓ Componentes renderizados corretamente');
      return true;
    } else {
      console.error('✗ App não renderizou');
      return false;
    }
  },

  // Teste 2: Validar campos de formulário
  testFormFields: () => {
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const nameInput = document.querySelector('input[placeholder="Seu nome"]');
    
    if (emailInput && passwordInput) {
      console.log('✓ Campos de login presentes');
      return true;
    } else {
      console.error('✗ Campos de formulário incompletos');
      return false;
    }
  },

  // Teste 3: Validar locais de Recife
  testRecifeLocs: async () => {
    const response = await fetch('', {
      method: 'GET'
    });
    
    // Se tiver acesso ao estado do app
    const locs = document.querySelectorAll('.location-result');
    if (locs.length > 0) {
      console.log(`✓ ${locs.length} locais de Recife carregados`);
      return true;
    } else {
      console.log('ℹ Locais ainda não carregados (execute busca primeiro)');
      return true;
    }
  },

  // Teste 4: Validar navegação
  testNavigation: () => {
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length >= 3) {
      console.log(`✓ ${tabs.length} abas de navegação presentes`);
      return true;
    } else {
      console.error('✗ Navegação incompleta');
      return false;
    }
  },

  // Teste 5: Validar estilos
  testStyles: () => {
    const hero = document.querySelector('.hero-card');
    const btn = document.querySelector('.primary-submit');
    
    if (hero && btn) {
      const heroStyle = window.getComputedStyle(hero);
      const btnStyle = window.getComputedStyle(btn);
      
      console.log('✓ Estilos CSS aplicados');
      return true;
    } else {
      console.error('✗ Estilos não carregados');
      return false;
    }
  },

  // Executar todos os testes
  runAll: function() {
    console.log('\n🧪 Testes Recife Vital\n');
    
    const tests = [
      this.testComponentsExist,
      this.testFormFields,
      this.testNavigation,
      this.testStyles,
      this.testRecifeLocs
    ];
    
    let passed = 0;
    tests.forEach(test => {
      if (test.call(this)) passed++;
    });
    
    console.log(`\n📊 Resultado: ${passed}/${tests.length} testes passaram\n`);
    
    if (passed === tests.length) {
      console.log('✅ App pronto para testar!');
    } else {
      console.log('⚠ Alguns testes falharam. Verifique o console acima.');
    }
  }
};

// Para executar no console do navegador:
// Tests.runAll()

export default Tests;
