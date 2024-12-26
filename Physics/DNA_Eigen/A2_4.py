#%%

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import matplotlib.animation as animation_module

#---------------------------------------------------------------------------
# Hesse Matrix as defined in the Anisotropic Network Model. 
def constructHesseMatrix(R, R_cut = 5, k = 1):
    n = len(R)
    H = np.zeros((3*n, 3*n))
    connectivity = []

    for i in range(n):      # running through the lower triangular part of H and calculating off diagonal elements
        for j in range(i):
            distance_Ri_Rj = np.linalg.norm(R[i,:] - R[j,:])  # calculating distance between Atoms i and j
            distance_ij_column_vector = np.array([R[j,0] - R[i,0],R[j,1] - R[i,1], R[j,2] - R[i,2]]).reshape(3, 1)
            if distance_Ri_Rj < R_cut:    
                H_ij = -k/distance_Ri_Rj**2 * distance_ij_column_vector @ distance_ij_column_vector.T
                connectivity.append((i,j))
                H[3*i:3*i+3, 3*j:3*j+3] = H_ij
                H[3*j:3*j+3, 3*i:3*i+3] = H_ij

    for i in range(n):   # setting main diagonal elements (Sum of superelements in a row must equal 0)
        sum_offdiagonal_elements = np.zeros((3,3))
        for j in range(n):
            if i != j:
                sum_offdiagonal_elements += H[3*i:3*i+3, 3*j:3*j+3]
        H[3*i:3*i+3, 3*i:3*i+3] = -sum_offdiagonal_elements
    return H, connectivity
#---------------------------------------------------------------------------
# calculating largest eigenvalue and eigenvector with the power method
def powerMethod(A, max_iter = 1000):
    n = A.shape[1]
    x = np.random.rand(n)    # starting vector
    for p in range(max_iter):
        x = A @ x
        x = x / np.linalg.norm(x, ord=2)
        lam = (x.reshape(1,n) @ A @ x.reshape(n,1)) / (x.reshape(1,n) @ x.reshape(n,1))     # calculating current eigenvalue
    return lam, x  

#-------------------------------------------------------------------------
# deflating Matrix aka setting n-th eigenvalue to 0
def deflateMatrix(matrix, eigenvalue, eigenvector):

    # getting vector length to reshape
    n = len(eigenvector)

    # deflate the matrix
    deflated_matrix = matrix - eigenvalue * eigenvector.reshape(n,1) @ eigenvector.reshape(1,n)
    return deflated_matrix

#importing data ------------------------------------------------------
data = np.genfromtxt("xyzm_dna.txt",delimiter=",")
R = data[:,:3]
m = data[:,3]

# building vector to initialize mass matrix M
m_3n = np.zeros(3*len(m)) 
for i in range(len(m)):
    m_3n[3*i], m_3n[3*i+1], m_3n[3*i+2] = m[i], m[i], m[i]

# setting up the stiffness matrix
M_3n_inverseRoot = np.diag(1 / np.sqrt(m_3n))
H_3n, connectivity = constructHesseMatrix(R)    
K_3n = M_3n_inverseRoot @ H_3n @ M_3n_inverseRoot

#%%
# making eigenvalues < 1
K_3n = K_3n / np.linalg.norm(K_3n,'fro')

largest_eigvecs = np.zeros((len(K_3n), 10))
largest_eigvals = np.zeros(10)

A = K_3n
for i in range(10):
    # getting largest eigval/vec
    lam, x = powerMethod(A) 

    # storing results in initialized variables
    largest_eigvecs[:, i] = x
    largest_eigvals[i] = lam

    # deflating A (setting largest eigval to zero)
    A = deflateMatrix(A, lam, x)


# ----------------------------------------------------------
# initializing variables to store smallest eigvals/vecs
smallest_eigvecs = np.zeros((len(K_3n), 10))
smallest_eigvals = np.zeros(10)
# calculating largest eigvals and vecs of (K' + Id)^(-1) via power method and deflating B
#B = K_3n_prime_plus_identity_inv
B = np.linalg.inv(K_3n)
for i in range(10):
    lam, x = powerMethod(B)
    smallest_eigvecs[:, i] = x
    smallest_eigvals[i] = lam
    B = deflateMatrix(B, lam, x)

#%%
eigvals, eigvecs = np.linalg.eig(K_3n)
sorted_indices = np.argsort(eigvals)
eigvals = eigvals[sorted_indices]
eigvecs = eigvecs[:,sorted_indices]

#%%--------------------------------------------------------------------
index = 10
x1 = eigvecs[0::3,index] 
y1 = eigvecs[1::3,index] 
z1 = eigvecs[2::3,index] 
n = len(x1)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

sc = ax.scatter(x1[:len(x1)//2]+ R[:n//2,0], y1[:len(x1)//2] + R[:n//2,1], z1[:len(x1)//2]+ R[:n//2,2], c='r',s=5)
sc2 = ax.scatter(x1[n//2:] + R[n//2:,0], y1[n//2:] +R[n//2:,1], z1[n//2:]+R[n//2:,2], c='b',s=5)


def update(frame, x, y, z, R):
    omega = 2*np.pi/100
    new_x = x  * 50 * np.sin(omega*frame) + R[:,0]
    new_y = y  * 50 * np.sin(omega*frame) + R[:,1]
    new_z = z  * 50 * np.sin(omega*frame) + R[:,2]
    sc._offsets3d = (new_x[:len(x)//2], new_y[:len(y)//2], new_z[:len(z)//2])
    sc2._offsets3d = (new_x[len(x)//2:], new_y[len(y)//2:], new_z[len(z)//2:])
    return sc, sc2


ani = animation_module.FuncAnimation(fig, update, fargs=(x1,y1,z1,R), frames=range(100), blit=True)
ani.save('animation.gif', writer='imagemagick', fps=10)   

   
# %%

with open("connectivity.txt", "w") as f:
    for i in range(len(connectivity)):
        f.write(f"{connectivity[i][0]} {connectivity[i][1]}\n")


with open("eigenvectors.txt", "w") as f:
    for i in range(len(m)):
        f.write(f"{eigvecs[3*i,index]} {eigvecs[3*i+1,index]} {eigvecs[3*i+2,index]}\n")

with open("positions.txt", "w") as f:
    for i in range(len(m)):
        f.write(f"{R[i,0]} {R[i,1]} {R[i,2]}\n")

