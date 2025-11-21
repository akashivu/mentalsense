package com.mentalsense.backend.repo;



import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.mentalsense.backend.model.User;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
