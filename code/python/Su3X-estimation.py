n = 1000
S = 0
for i in range(n):
    u = rand()
    S = S + sqrt(-2 * log(1 - u))
print("Valeur approchée de I = ")
print(S / n)
