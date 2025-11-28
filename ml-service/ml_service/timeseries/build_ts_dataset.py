import numpy as np

def build_sequences(values, seq_len=10):
    """
    Convert a 1D list/array of values into sliding window sequences.
    X shape -> (n_samples, seq_len)
    y shape -> (n_samples,)
    """
    X, y = [], []
    for i in range(len(values) - seq_len):
        X.append(values[i:i+seq_len])
        y.append(values[i+seq_len])
    return np.array(X), np.array(y)
