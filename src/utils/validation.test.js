// Simple validation tests for Register component
// Run these tests manually in browser console

const testValidations = () => {
  
  
  // Test name validation
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 50) return "Name must be less than 50 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return null;
  };

  // Test email validation
  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return "Please enter a valid email address";
    if (email.length > 100) return "Email must be less than 100 characters";
    return null;
  };

  // Test phone validation
  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return "Phone number must be 10 digits";
    return null;
  };

  // Test password validation
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 128) return "Password must be less than 128 characters";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    return null;
  };

  // Test cases
  const tests = [
    // Name tests
    { func: validateName, input: "", expected: "Name is required" },
    { func: validateName, input: "A", expected: "Name must be at least 2 characters" },
    { func: validateName, input: "John123", expected: "Name can only contain letters, spaces, hyphens, and apostrophes" },
    { func: validateName, input: "John Doe", expected: null },
    { func: validateName, input: "Mary-Jane O'Connor", expected: null },

    // Email tests
    { func: validateEmail, input: "", expected: "Email is required" },
    { func: validateEmail, input: "invalid-email", expected: "Please enter a valid email address" },
    { func: validateEmail, input: "test@example.com", expected: null },

    // Phone tests
    { func: validatePhoneNumber, input: "", expected: null },
    { func: validatePhoneNumber, input: "123", expected: "Phone number must be 10 digits" },
    { func: validatePhoneNumber, input: "0123456789", expected: null },
    { func: validatePhoneNumber, input: "1234567890", expected: null },
    { func: validatePhoneNumber, input: "9876543210", expected: null },
    { func: validatePhoneNumber, input: "98765 43210", expected: null },
    { func: validatePhoneNumber, input: "8123456789", expected: null },
    { func: validatePhoneNumber, input: "7987654321", expected: null },
    { func: validatePhoneNumber, input: "6123456789", expected: null },
    { func: validatePhoneNumber, input: "5555555555", expected: null },
    { func: validatePhoneNumber, input: "2222222222", expected: null },

    // Password tests
    { func: validatePassword, input: "", expected: "Password is required" },
    { func: validatePassword, input: "12345", expected: "Password must be at least 6 characters" },
    { func: validatePassword, input: "password", expected: "Password must contain at least one uppercase letter" },
    { func: validatePassword, input: "Password", expected: "Password must contain at least one number" },
    { func: validatePassword, input: "Password123", expected: null },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const result = test.func(test.input);
    if (result === test.expected) {
      
      passed++;
    } else {
      
      failed++;
    }
  });

  
  return { passed, failed };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testValidations = testValidations;
}

export default testValidations;