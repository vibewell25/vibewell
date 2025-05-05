/* eslint-disable */
// AST-based test cleanup using ts-morph

const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');
const glob = require('glob');

// Initialize ts-morph project using web tsconfig
const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

const rootDir = path.resolve(__dirname, '../');
const pattern = 'src/**/*.{test,spec}.{ts,tsx}';
const testFiles = glob.sync(pattern, { cwd: rootDir, absolute: true });

console.log(`Found ${testFiles.length} test files. Starting AST cleanup...`);

testFiles.forEach((filePath) => {
  const sourceFile = project.addSourceFileAtPath(filePath);
  if (!sourceFile) return;

  // 1) Remove all statements before the first import
  const imports = sourceFile.getImportDeclarations();
  if (imports.length > 0) {
    const firstPos = imports[0].getPos();
    sourceFile.getStatements().slice().forEach((stmt) => {
      if (stmt.getPos() < firstPos) stmt.remove();
    });
  }

  // 2) Remove ESLint disable comments
  sourceFile.getDescendantsOfKind(SyntaxKind.MultiLineCommentTrivia)
    .filter((c) => c.getText().includes('eslint-'))
    .forEach((c) => c.remove());

  // 3) Fix jest.mock arrow function to use block bodies
  try {
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getText() === 'jest.mock')
      .forEach((call) => {
        const args = call.getArguments();
        if (args.length === 2 && args[1].getKind() === SyntaxKind.ArrowFunction) {
          const arrow = args[1];
          const bodyNode = arrow.getBody();
          // Only transform if not already a block
          if (bodyNode.getKind() !== SyntaxKind.Block) {
            let exprNode;
            if (bodyNode.getKind() === SyntaxKind.ParenthesizedExpression) {
              exprNode = bodyNode.getExpression();
            } else {
              exprNode = bodyNode;
            }
            const exprText = exprNode.getText();
            try {
              arrow.setBodyText(`return ${exprText};`);
            } catch (err) {
              // skip if unable to set body
            }
          }
        }
      });
  } catch (err) {
    // skip jest.mock transformations on parse errors
  }

  // 4) Fix render calls ending with comma
  sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .filter((stmt) => stmt.getText().trim().startsWith('render('))
    .forEach((stmt) => {
      let txt = stmt.getText();
      if (txt.trim().endsWith(',')) {
        txt = txt.replace(/,$/, ';');
        stmt.replaceWithText(txt);
      }
    });

  // 5) Remove standalone parentheses lines
  sourceFile.getDescendantsOfKind(SyntaxKind.ExpressionStatement)
    .filter((stmt) => /^\s*\)\s*;?$/.test(stmt.getText()))
    .forEach((stmt) => stmt.remove());

  sourceFile.saveSync();
  console.log(`Cleaned ${path.relative(rootDir, filePath)}`);
});

console.log('AST cleanup complete.'); 