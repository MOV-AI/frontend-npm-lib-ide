import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FlowTopBar from "./FlowTopBar";
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import { ThemeProvider, createTheme } from "@material-ui/core/styles"; // Corrigido aqui

// Criar o tema corretamente
const theme = createTheme();

// Helper para renderizar com tema
const renderWithTheme = (ui, options) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);

// Mock i18n
jest.mock("@mov-ai/mov-fe-lib-react", () => ({
  i18n: {
    t: (key, opts) => (opts ? `${key}_${JSON.stringify(opts)}` : key),
  },
}));

// Mock icons
jest.mock("@material-ui/icons/Grain", () => () => <div>GrainIcon</div>);
jest.mock("@material-ui/icons/PlayArrow", () => () => <div>PlayIcon</div>);
jest.mock("@material-ui/icons/Stop", () => () => <div>StopIcon</div>);

// Props padrão
const defaultProps = {
  call: jest.fn(() => Promise.resolve({})),
  alert: jest.fn(),
  scope: "test-scope",
  loading: false,
  mainInterface: {
    current: { graph: { validateFlow: jest.fn(), warnings: [] } },
  },
  id: "flow-id",
  name: "flow-name",
  onRobotChange: jest.fn(),
  onViewModeChange: jest.fn(),
  viewMode: FLOW_VIEW_MODE.default,
  searchProps: { visible: true, options: [], onChange: jest.fn() },
  confirmationAlert: jest.fn(),
  canRun: true,
};

describe("FlowTopBar", () => {
  it("renders without crashing", () => {
    renderWithTheme(<FlowTopBar {...defaultProps} />);
  });

  it("should render FlowTopBar component", async () => {
    renderWithTheme(<FlowTopBar {...defaultProps} />);
    expect(await screen.findByTestId("input_change-robot")).toBeInTheDocument();
    expect(screen.getByTestId("section_view-search")).toBeInTheDocument();
  });

  it("should trigger view mode change", () => {
    renderWithTheme(<FlowTopBar {...defaultProps} />);
    const treeToggle = screen.getByTestId("input_tree-view-flow");
    fireEvent.click(treeToggle);
    expect(defaultProps.onViewModeChange).toHaveBeenCalled();
  });

  it("should disable run button if robot is offline or loading", () => {
    renderWithTheme(
      <FlowTopBar
        {...defaultProps}
        robotStatus={{ isOnline: false, activeFlow: "" }}
      />,
    );
    const runButton = screen.getByTestId("input_save-before-start");
    expect(runButton).toBeDisabled();
  });

  it("should call onRobotChange when robot is selected", async () => {
    const updatedProps = {
      ...defaultProps,
      onRobotChange: jest.fn(),
    };

    renderWithTheme(<FlowTopBar {...updatedProps} />);
    const select = await screen.findByTestId("input_change-robot");
    fireEvent.change(select, { target: { value: "robot-1" } });

    await waitFor(() => {
      expect(updatedProps.onRobotChange).toHaveBeenCalledWith("robot-1");
    });
  });

  it("should show confirmation alert if flow already running", async () => {
    const updatedProps = {
      ...defaultProps,
      confirmationAlert: jest.fn(),
      robotStatus: {
        isOnline: true,
        activeFlow: "another-flow",
      },
      robotList: {
        "robot-1": { RobotName: "Robot One", isDefault: true },
      },
      canRun: true,
    };

    renderWithTheme(<FlowTopBar {...updatedProps} />);
    const startButton = await screen.findByTestId("input_save-before-start");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(updatedProps.confirmationAlert).toHaveBeenCalled();
    });
  });
});
