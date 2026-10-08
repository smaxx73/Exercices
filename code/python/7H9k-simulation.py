def simulation(theta, n):
    S = 0
    for i in range(n):
        S = S - log(rand()) / theta
    return n / S
