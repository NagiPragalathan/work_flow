import { StageType } from "../types";

interface ProgressIndicatorProps {
  currentStage: StageType | null;
}

const stages = [
  { stage: StageType.IDEA, label: "Idea" },
  { stage: StageType.PLANNING, label: "Planning" },
  { stage: StageType.CODING, label: "Coding" },
  { stage: StageType.BUILDING, label: "Building" },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStage,
}) => {
  const getCurrentStageIndex = () => {
    if (!currentStage) return -1;
    if (currentStage === StageType.ERROR) return -1;
    if (currentStage === StageType.COMPLETE) return stages.length;
    return stages.findIndex((s) => s.stage === currentStage);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {stages.map((stage, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isError = currentStage === StageType.ERROR;

          return (
            <div key={stage.stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isError && isActive
                      ? "bg-red-600 text-white"
                      : isActive
                      ? "bg-blue-600 text-white ring-4 ring-blue-600/30"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    isActive || isCompleted
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    isCompleted ? "bg-green-600" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {currentStage === StageType.COMPLETE && (
        <div className="text-center mt-4">
          <span className="inline-flex items-center px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
            ✓ Generation Complete
          </span>
        </div>
      )}
      {currentStage === StageType.ERROR && (
        <div className="text-center mt-4">
          <span className="inline-flex items-center px-4 py-2 bg-red-600/20 text-red-400 rounded-full text-sm font-medium">
            ✗ Error Occurred
          </span>
        </div>
      )}
    </div>
  );
};

