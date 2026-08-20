def surprise(a, b):
    L = []
    for p in range(5):
        S = 0
        for i in range(10 ** p):
            S = S + pareto(a, b)
        L.append(S / 10 ** p)
    return L
