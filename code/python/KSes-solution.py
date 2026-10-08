n = 1000
S = 0
for i in range(n):
    u = 4 * rand()
    S = S + 1 / sqrt(2 * pi) * exp(-u ** 2 / 2)
print(4 * S / n)
