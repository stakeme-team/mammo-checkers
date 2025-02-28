mergeInto(LibraryManager.library, {
  MovePiece: function (matchId, fromX, fromY, toX, toY) {
    window.dispatchReactUnityEvent("MovePiece", matchId, fromX, fromY, toX, toY);
  },
  
  MoveCornerPiece: function (matchId, fromAndToPathPointer, arraySize) {
      var steps = new Int32Array(HEAP32.buffer, fromAndToPathPointer, arraySize); // Читаем как int32
      window.dispatchReactUnityEvent("MoveCornerPiece", matchId, Array.from(steps));
    }
});