/* eslint-disable */import { createTestRunner } from "../../test-utils/test-runner";
import PerformanceExample from "./PerformanceExample";

// Create a test runner for the PerformanceExample component
const testRunner = createTestRunner("PerformanceExample", {
  performanceMetrics: true,
});

// Destructure screen and other utilities from the testRunner
const { screen, user } = testRunner;

describe("PerformanceExample Component", () => {
  testRunner.test("renders correctly", () => {
    // Render the component
    testRunner.render(<PerformanceExample />);

    // Check that the component renders correctly
    expect(
      screen.getByText("Performance Monitoring Example")
    ).toBeInTheDocument();
    expect(screen.getByText("Run Expensive Operation")).toBeInTheDocument();
    expect(screen.getByText("Operations run: 0")).toBeInTheDocument();
    expect(
      screen.getByText("No operations run yet. Click the button to start.")
    ).toBeInTheDocument();
  });

  testRunner.test(
    "runs expensive operation when button is clicked",
    async () => {
      // Render the component
      testRunner.render(<PerformanceExample />);

      // Click the button
      const button = screen.getByText("Run Expensive Operation");
      await user.click(button);

      // Check that the operation was run
      expect(screen.getByText("Operations run: 1")).toBeInTheDocument();
      expect(
        screen.queryByText("No operations run yet. Click the button to start.")
      ).not.toBeInTheDocument();

      // The result should be in the list
      const resultItem = screen.getByText(/Operation completed in .* result:/);
      expect(resultItem).toBeInTheDocument();

  testRunner.testPerformance("renders efficiently", <PerformanceExample />, {
    iterations: 3,
    threshold: 500, // Higher threshold for testing
  });

  testRunner.testAccessibility(
    "has no accessibility violations",
    <PerformanceExample />

});
