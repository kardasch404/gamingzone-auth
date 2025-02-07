<?php
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management</title>
    <link rel="stylesheet" href=".\style.css">
</head>
<body>

<div class="container">
    <h1>User Management</h1>
    <!-- Add User Form -->
    <div class="form-container">
        <h2>Add User</h2>
        <form>
            <input type="text" name="name" placeholder="Enter Name" required>
            <input type="age" name="age" placeholder="Enter age" required>
            <input type="email" name="email" placeholder="Enter email" required>
            <button type="submit">Add User</button>
        </form>
    </div>

    <!-- User List -->
    <h2>User List</h2>
    <table>
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
            <?php foreach ($users as $user): ?>
        <tr>
            <td><?= $user->id; ?></td>
            <td><?= $user->nom; ?></td>
            <td><?= $user->age; ?></td>
            <td><?= $user->email; ?></td>
<!--            <form method="post" action="/" >-->
<!--                <a href="edit.php?id=--><?php //= $user -> id ?><!--" class="edit-btn">Edit</a>-->
<!--                <a href="delete.php?id=--><?php //= $user -> id ?><!--" class="delete-btn" onclick="return confirm('Are you sure?')">Delete</a>-->
<!--            </form>-->
            <form method="POST">
                <button type="submit" name="deleteInfo" value="<?= $user->id; ?>" >Delete</button>
            </form>
        </tr>
            <?php endforeach; ?>

        </tbody>
    </table>
</div>

</body>
</html>



