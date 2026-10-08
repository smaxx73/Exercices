n = 1000
S = 0
for i in range(n):
    u = rand()
    S = S + sin(sqrt(u))
print("Valeur approchée de I = ")
print(S / n)
