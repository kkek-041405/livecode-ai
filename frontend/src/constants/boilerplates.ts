export type Language = 'python' | 'javascript' | 'c' | 'cpp' | 'java';

export interface LanguageConfig {
  id: Language;
  label: string;
  monacoLang: string;
  icon: string;
  boilerplate: string;
}

export const languages: LanguageConfig[] = [
  {
    id: 'python',
    label: 'Python',
    monacoLang: 'python',
    icon: '🐍',
    boilerplate: `# LiveCode+ — Python
# Write your code below

def main():
    name = input("Enter your name: ")
    print(f"Hello, {name}! Welcome to LiveCode+")
    
    # Example: Sum of numbers
    numbers = [1, 2, 3, 4, 5]
    total = sum(numbers)
    print(f"Sum of {numbers} = {total}")

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLang: 'javascript',
    icon: '⚡',
    boilerplate: `// LiveCode+ — JavaScript
// Write your code below

function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Hello from LiveCode+!");
  
  // Example: Fibonacci
  const fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  };

  for (let i = 0; i < 10; i++) {
    console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
  }
}

main();
`,
  },
  {
    id: 'c',
    label: 'C',
    monacoLang: 'c',
    icon: '🔧',
    boilerplate: `// LiveCode+ — C
// Write your code below

#include <stdio.h>
#include <string.h>

int main() {
    char name[100];
    printf("Enter your name: ");
    scanf("%s", name);
    printf("Hello, %s! Welcome to LiveCode+\\n", name);
    
    // Example: Factorial
    int n = 10;
    long long fact = 1;
    for (int i = 2; i <= n; i++) {
        fact *= i;
    }
    printf("Factorial of %d = %lld\\n", n, fact);
    
    return 0;
}
`,
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoLang: 'cpp',
    icon: '⚙️',
    boilerplate: `// LiveCode+ — C++
// Write your code below

#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string name;
    cout << "Enter your name: ";
    cin >> name;
    cout << "Hello, " << name << "! Welcome to LiveCode+" << endl;
    
    // Example: Sort and display
    vector<int> nums = {5, 2, 8, 1, 9, 3};
    sort(nums.begin(), nums.end());
    
    cout << "Sorted: ";
    for (int n : nums) cout << n << " ";
    cout << endl;
    
    return 0;
}
`,
  },
  {
    id: 'java',
    label: 'Java',
    monacoLang: 'java',
    icon: '☕',
    boilerplate: `// LiveCode+ — Java
// Write your code below

import java.util.Scanner;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "! Welcome to LiveCode+");
        
        // Example: Array operations
        int[] numbers = {5, 2, 8, 1, 9, 3};
        Arrays.sort(numbers);
        System.out.println("Sorted: " + Arrays.toString(numbers));
        
        scanner.close();
    }
}
`,
  },
];

export const getLanguageById = (id: Language): LanguageConfig => {
  return languages.find(l => l.id === id) || languages[0];
};
